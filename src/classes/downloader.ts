import { input } from '@inquirer/prompts';
import Path from '@kikiutils/classes/path';
import logger from '@kikiutils/node/logger';
import { sleep } from 'bun';
import { load } from 'cheerio';
import { Presets, SingleBar } from 'cli-progress';

import paths from '@/constants/paths';
import { fetchGet } from '@/utils';

const progressBar = new SingleBar({}, Presets.shades_classic);

export default class Downloader {
	#aid: string;
	#bookDirPath!: Path;
	#downloadingCount: number = 0;

	constructor(aidOrUrl: string) {
		const aid = (+aidOrUrl).toString() === aidOrUrl ? aidOrUrl : aidOrUrl.match(/aid-(\d+)/)?.[1];
		if (!aid) throw new Error(`錯誤的aid或網址：${aidOrUrl}`);
		this.#aid = aid;
	}

	async #checkDownloadedImages(targetFilesCount: number) {
		const images = await this.#bookDirPath.readdir();
		return images?.length === targetFilesCount;
	}

	async #downloadImage(index: string, pageUrl: string, url: string) {
		if (url.startsWith('//')) url = `https:${url}`;
		const response = await fetchGet(url, pageUrl);
		if (response.status !== 200) return logger.error(`獲取圖片錯誤，網址：${url}`);
		const savePath = this.#getImageSavePath(index, response, url);
		await Bun.write(savePath.toString(), await response.arrayBuffer());
	}

	async #downloadImagePage(index: string, pageUrl: string) {
		while (this.#downloadingCount > 30) await sleep(50);
		this.#downloadingCount++;
		const url = `https://wnacg.com${pageUrl}`;
		const response = await fetchGet(url);
		const root = load(await response.text(), {}, true);
		const imageUrl = root('#picarea').attr('src');
		if (imageUrl) await this.#downloadImage(index, url, imageUrl);
		this.#downloadingCount--;
		progressBar.increment();
	}

	async #getAllImagePageUrls(pageCount: number) {
		const promises = [];
		for (let i = 1; i <= pageCount; i++) promises.push(this.#getIndexPageImagePageUrls(i));
		return (await Promise.all(promises)).flat();
	}

	#getImageSavePath(index: string, response: Response, url: string) {
		const contentType = response.headers.get('content-type');
		let ext: string = '';
		if (contentType) ext = contentType.split(';')[0]!.split('/')[1]!;
		else ext = url.split('.').pop()!;
		return this.#bookDirPath.join(`${index}.${ext}`);
	}

	async #getInfo() {
		const response = await fetchGet(`https://wnacg.com/photos-index-page-1-aid-${this.#aid}.html`);
		const root = load(await response.text(), {}, true);
		const titleEl = root('h2');
		const lastPageHrefEl = root('div.f_left.paginator > a').last();
		return { pageCount: +(lastPageHrefEl?.text() || 1), title: titleEl.text().trim() };
	}

	async #getIndexPageImagePageUrls(index: number) {
		const response = await fetchGet(`https://wnacg.com/photos-index-page-${index}-aid-${this.#aid}.html`);
		if (response.status > 400) throw new Error('Get page Error.');
		const root = load(await response.text(), {}, true);
		const linkEls = root('div.pic_box.tb a');
		return linkEls.map((_, linkEl) => linkEl.attribs['href']).toArray();
	}

	async #processAllImagePages(allImagePageUrls: string[]) {
		const numberOfDigits = allImagePageUrls.length.toString().length;
		progressBar.start(allImagePageUrls.length, 0);
		await Promise.all(allImagePageUrls.map(async (url, index) => this.#downloadImagePage(`${index + 1}`.padStart(numberOfDigits, '0'), url)));
		progressBar.stop();
	}

	async start() {
		logger.info(`開始下載 ${this.#aid}.`);
		const info = await this.#getInfo();
		logger.info(`標題：${info.title}`);
		while (info.title.length > 96) info.title = (await input({ message: '書名過長，請輸入替代名稱：', required: true })).replaceAll(/\/|\.\./gi, '');
		this.#bookDirPath = paths.books.join(info.title);
		await this.#bookDirPath.mkdirs();
		const allImagePageUrls = await this.#getAllImagePageUrls(info.pageCount);
		logger.info(`圖片數：${allImagePageUrls.length}張`);
		await this.#processAllImagePages(allImagePageUrls);
		if (await this.#checkDownloadedImages(allImagePageUrls.length)) return logger.info(`下載完成`);
		logger.error(`已下載圖片數與總圖片數不一致`);
	}
}

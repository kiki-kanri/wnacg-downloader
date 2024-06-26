import Path from '@kikiutils/classes/path';
import logger from '@kikiutils/node/logger';
import { sleep } from 'bun';
import { load } from 'cheerio';
import { Presets, SingleBar } from 'cli-progress';
import inquirer from 'inquirer';
import type { QuestionCollection } from 'inquirer';

import paths from '@/constants/paths';
import { useGet } from '@/library/fetch';

const progressBar = new SingleBar({}, Presets.shades_classic);

interface PromptAnswers {
	title: string;
}

const promptOptions: QuestionCollection<PromptAnswers> = { message: '書名過長，請輸入替代名稱：', name: 'title' };

export default class Downloader {
	#aid: string;
	#bookDirPath!: Path;
	#downloadingCount: number = 0;

	constructor(aidOrUrl: string) {
		const aid = (+aidOrUrl).toString() === aidOrUrl ? aidOrUrl : aidOrUrl.match(/aid-(\d+)/)?.[1];
		if (!aid) throw new Error('Aid or url error');
		this.#aid = aid;
	}

	async #checkDownloadedImages(targetFilesCount: number) {
		const images = await this.#bookDirPath.readdir({ withFileTypes: true });
		return images?.length === targetFilesCount;
	}

	async #downloadImage(index: string, pageUrl: string, url: string) {
		if (url.startsWith('//')) url = `https:${url}`;
		const response = await useGet(url, pageUrl);
		if (response.status !== 200) return logger.error(`Get image ${url} error!`);
		const savePath = this.#getImageSavePath(index, response, url);
		await Bun.write(savePath.toString(), await response.arrayBuffer());
	}

	async #downloadImagePage(index: string, pageUrl: string) {
		while (this.#downloadingCount > 30) await sleep(50);
		this.#downloadingCount++;
		const url = `https://wnacg.com${pageUrl}`;
		const response = await useGet(url);
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
		const response = await useGet(`https://wnacg.com/photos-index-page-1-aid-${this.#aid}.html`);
		const root = load(await response.text(), {}, true);
		const titleEl = root('h2');
		const lastPageHrefEl = root('div.f_left.paginator > a').last();
		return { pageCount: +(lastPageHrefEl?.text() || 1), title: titleEl.text().trim() };
	}

	async #getIndexPageImagePageUrls(index: number) {
		const response = await useGet(`https://wnacg.com/photos-index-page-${index}-aid-${this.#aid}.html`);
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
		logger.info(`Start download ${this.#aid}.`);
		const info = await this.#getInfo();
		logger.info(`Title：${info.title}`);
		while (info.title.length > 96) {
			const answers = await inquirer.prompt(promptOptions);
			info.title = answers.title.replaceAll(/\/|\.\./gi, '');
		}

		this.#bookDirPath = paths.books.join(info.title);
		await this.#bookDirPath.mkdirs();
		const allImagePageUrls = await this.#getAllImagePageUrls(info.pageCount);
		logger.info(`Images count ${allImagePageUrls.length}.`);
		await this.#processAllImagePages(allImagePageUrls);
		if (await this.#checkDownloadedImages(allImagePageUrls.length)) return logger.info(`Success download ${info.title}`);
		logger.error(`${info.title} images count not correct!`);
	}
}

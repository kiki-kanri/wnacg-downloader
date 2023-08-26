import { load } from 'cheerio';
import { Presets, SingleBar } from 'cli-progress';
import { readdir, writeFile } from 'fs/promises';
import { mkdirs } from 'fs-extra';
import inquirer, { QuestionCollection } from 'inquirer';
import logger from 'node-color-log';
import { Response } from 'node-fetch';

import { useGet } from '@/library/fetch';
import paths, { join } from '@/library/paths';
import { sleep } from 'sleep-ts';

const progressBar = new SingleBar({}, Presets.shades_classic);

interface PromptAnswers {
	title: string;
}

const promptOptions: QuestionCollection<PromptAnswers> = {
	message: '書名過長，請輸入替代名稱：',
	name: 'title'
};

export default class Downloader {
	private aid: string;
	private bookDirPath!: string;
	private downloadingCount: number = 0;

	constructor(aidOrUrl: string) {
		const aid = aidOrUrl.match(/(aid-)?(\d+)/)?.[2];
		if (!aid) throw new Error('Aid or url error');
		this.aid = aid;
	}

	private async checkDownloadedImages(targetFilesCount: number) {
		const images = await readdir(this.bookDirPath);
		return images.length === targetFilesCount;
	}

	private async downloadImage(index: string, url: string) {
		if (url.startsWith('//')) url = `https:${url}`;
		const response = await useGet(url);
		if (response.status !== 200) return logger.error(`Get image ${url} error!`);
		const savePath = this.getImageSavePath(index, response, url);
		await writeFile(savePath, Buffer.from(await response.arrayBuffer()));
	}

	private async downloadImagePage(index: string, pageUrl: string) {
		while (this.downloadingCount > 30) await sleep(50);
		this.downloadingCount++;
		const response = await useGet(`https://wnacg.com${pageUrl}`);
		const root = load(await response.text(), {}, true);
		const imageUrl = root('#picarea').attr('src');
		if (imageUrl) await this.downloadImage(index, imageUrl);
		this.downloadingCount--;
		progressBar.increment();
	}

	private async getAllImagePageUrls(pageCount: number) {
		const promises = [];
		for (let i = 1; i <= pageCount; i++) promises.push(this.getIndexPageImagePageUrls(i));
		return (await Promise.all(promises)).flat();
	}

	private getImageSavePath(index: string, response: Response, url: string) {
		const contentType = response.headers.get('content-type');
		let ext: string = '';
		if (contentType) ext = contentType.split(';')[0].split('/')[1];
		else ext = url.split('.').pop()!;
		return join(this.bookDirPath, `${index}.${ext}`);
	}

	private async getInfo() {
		const response = await useGet(`https://wnacg.com/photos-index-page-1-aid-${this.aid}.html`);
		const root = load(await response.text(), {}, true);
		const titleEl = root('h2');
		const lastPageHrefEl = root('div.f_left.paginator > a').last();
		return {
			pageCount: parseInt(lastPageHrefEl?.text() || '1'),
			title: titleEl.text().trim()
		}
	}

	private async getIndexPageImagePageUrls(index: number) {
		const response = await useGet(`https://wnacg.com/photos-index-page-${index}-aid-${this.aid}.html`);
		if (response.status > 400) throw new Error('Get page Error.');
		const root = load(await response.text(), {}, true);
		const linkEls = root('div.pic_box.tb a');
		return linkEls.map((_, linkEl) => linkEl.attribs['href']).toArray();
	}

	private async processAllImagePages(allImagePageUrls: string[]) {
		const numberOfDigits = allImagePageUrls.length.toString().length;
		const baseIndex = '0'.repeat(numberOfDigits);
		progressBar.start(allImagePageUrls.length, 0);
		const promises = allImagePageUrls.map(async (url, index) => this.downloadImagePage(`${baseIndex}${index + 1}`.slice(-numberOfDigits), url));
		await Promise.all(promises);
		progressBar.stop();
	}

	async start() {
		logger.info(`Start download ${this.aid}.`);
		const info = await this.getInfo();
		logger.info(`Title：${info.title}`);
		while (info.title.length > 64) {
			const answers = await inquirer.prompt(promptOptions);
			info.title = answers.title.replaceAll(/\/|\.\./gi, '');
		}

		this.bookDirPath = join(paths.books, info.title);
		await mkdirs(this.bookDirPath);
		const allImagePageUrls = await this.getAllImagePageUrls(info.pageCount);
		logger.info(`Images count ${allImagePageUrls.length}.`);
		await this.processAllImagePages(allImagePageUrls);
		if (await this.checkDownloadedImages(allImagePageUrls.length)) return logger.success(`Success download ${info.title}`);
		logger.error(`${info.title} images count not correct!`);
	}
}

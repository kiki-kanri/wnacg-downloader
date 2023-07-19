import { load } from 'cheerio';
import { Presets, SingleBar } from 'cli-progress';
import { mkdirs, writeFile } from 'fs-extra';
import logger from 'node-color-log';
import { Response } from 'node-fetch-commonjs';

import { useGet } from '@/library/fetch';
import paths, { join } from '@/library/paths';
import { sleep } from 'sleep-ts';

const progressBar = new SingleBar({}, Presets.shades_classic);

export default class Downloader {
	private aid: string;
	private bookDirPath!: string;
	private downloadingCount = 0;

	constructor(aidOrUrl: string) {
		const aid = aidOrUrl.match(/(aid-)?(\d+)/)?.[2];
		if (!aid) throw new Error('Aid or url error');
		this.aid = aid;
	}

	private async downloadImage(index: string, url: string) {
		if (url.startsWith('//')) url = `https:${url}`;
		const response = await useGet(url);
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
		this.bookDirPath = join(paths.books, info.title);
		await mkdirs(this.bookDirPath);
		const allImagePageUrls = await this.getAllImagePageUrls(info.pageCount);
		logger.info(`Images count ${allImagePageUrls.length}.`);
		await this.processAllImagePages(allImagePageUrls);
		logger.success(`Success download ${info.title}`);
	}
}
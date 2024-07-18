import { input } from '@inquirer/prompts';
import logger from '@kikiutils/node/logger';

import Downloader from '@/classes/downloader';

logger.level = 'info';
async function main() {
	while (true) {
		const aidsOrUrlsString = (await input({ message: '請輸入網址或aid(多個請用空格分隔)：', required: true })).trim();
		const aidsOrUrls = aidsOrUrlsString.split(' ');
		for (const aidOrUrl of aidsOrUrls) {
			if (!aidOrUrl.trim()) continue;
			try {
				const downloader = new Downloader(aidOrUrl);
				await downloader.start();
			} catch (error) {
				logger.error(error);
			}

			await Bun.sleep(500);
			console.log();
		}
	}
}

(async () => await main())();

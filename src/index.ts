import { input } from '@inquirer/prompts';
import logger from '@kikiutils/node/consola';

import { Downloader } from '@/classes/downloader';

logger.level = 3;

(async () => {
	while (true) {
		const aidsOrUrlsString = (await input({ message: '請輸入網址或aid(多個請用空格分隔)：', required: true })).trim();
		const aidsOrUrls = aidsOrUrlsString.split(' ');
		for (let aidOrUrl of aidsOrUrls) {
			aidOrUrl = aidOrUrl.trim();
			if (!aidOrUrl) continue;
			try {
				await new Downloader(aidOrUrl).run();
			} catch (error) {
				logger.error(error);
			}

			await Bun.sleep(500);
		}
	}
})();

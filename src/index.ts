import logger from 'node-color-log';
import readlineSync from 'readline-sync';

import Downloader from '@/classes/downloader';

process.setMaxListeners(0);

async function main() {
	while (true) {
		const aidsOrUrlsString = readlineSync.question('請輸入網址或aid(多個請用空格分隔)：').trim();
		const aidsOrUrls = aidsOrUrlsString.split(' ');
		for (const aidOrUrl of aidsOrUrls) {
			if (!aidOrUrl.trim()) continue;
			try {
				const downloader = new Downloader(aidOrUrl);
				await downloader.start();
			} catch (error) {
				logger.error(error);
			}
		}
	}
}

(async () => require.main === module && await main())();

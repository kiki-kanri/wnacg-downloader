import { input } from '@inquirer/prompts';
import logger from '@kikiutils/node/consola';

import { Downloader } from '@/classes/downloader';

logger.level = 3;
(async () => {
    while (true) {
        const aidsOrURLsString = (await input({
            message: '請輸入網址或aid(多個請用空格分隔)：',
            required: true,
        })).trim();

        for (let aidOrURL of aidsOrURLsString.split(/ +/g)) {
            aidOrURL = aidOrURL.trim();
            if (!aidOrURL) continue;
            try {
                await new Downloader(aidOrURL).run();
            } catch (error) {
                logger.error(error);
            }

            await Bun.sleep(500);
        }
    }
})();

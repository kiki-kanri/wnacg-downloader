import inquirer, { QuestionCollection } from 'inquirer';
import logger from 'node-color-log';

import Downloader from '@/classes/downloader';

process.setMaxListeners(0);

interface PromptAnswers {
	aidsOrUrlsString: string;
}

const promptOptions: QuestionCollection<PromptAnswers> = {
	message: '請輸入網址或aid(多個請用空格分隔)：',
	name: 'aidsOrUrlsString'
};

async function main() {
	while (true) {
		const answers = await inquirer.prompt(promptOptions);
		const aidsOrUrlsString = answers.aidsOrUrlsString.trim();
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

(async () => await main())();

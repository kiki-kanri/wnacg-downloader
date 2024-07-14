const fetchHeaders = {
	'accept-encoding': 'gzip',
	'accept-language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
	'cache-control': 'no-cache',
	'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
	'sec-ch-ua-mobile': '?0',
	'sec-ch-ua-platform': '"Windows"',
	'sec-fetch-dest': 'document',
	'sec-fetch-mode': 'no-cors',
	'sec-fetch-site': 'cross-site',
	'sec-fetch-user': '?1',
	'upgrade-insecure-requests': '1',
	'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
	accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
	pragma: 'no-cache'
};

export const fetchGet = async (url: string, referrer?: string) => await fetch(url, { headers: fetchHeaders, method: 'GET', referrer });

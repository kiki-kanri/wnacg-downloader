import multiprocessing
import requests

from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from kikiutils.file import create_dir, save_file
from kikiutils.requests import get_response

from log import logger


class Wnacg:
    def start(self, urls: list[str]):
        for url in urls:
            if url:
                self.start_download(url)

    def start_download(self, url: str):
        logger.info(f'Start download {url}.')

        # Get aid
        if url.isdigit():
            aid = url
        else:
            aid = url[url.find('aid-') + 4:url.find('.html')]

        if not aid:
            return False

        # Get page title and pages count
        title, pages_count = self.get_page_info(aid)

        if title is None:
            logger.error('Url error！')
            return False

        logger.info(f'Title：{title}')
        logger.info(f'Pages count：{pages_count}')
        self.book_dir_path = f'./wnacg_books/{title}'
        create_dir(self.book_dir_path)

        # Get image page urls and count
        logger.info('Start get image urls and images count.')
        pool = multiprocessing.Pool(32)
        args = [[aid, page] for page in range(1, pages_count + 1)]
        result = pool.starmap(self.get_image_page_urls, args)
        image_page_urls = [url for item in result for url in item]
        images_count = len(image_page_urls)
        logger.info(f'Images count：{images_count}.')

        # Get image
        logger.info('Start download image.')
        image_count_str_length = len(str(images_count))
        base_index = '0' * (image_count_str_length + 1)
        download_image_args = []

        for i in range(images_count):
            download_image_args.append((
                image_page_urls[i],
                f'{base_index}{i + 1}'[-image_count_str_length:]
            ))

        pool.starmap(self.get_image, download_image_args)
        pool.close()
        pool.join()
        logger.success(f'Success download {title}.')

    def get_image(self, url: str, file_index: str):
        """下載圖片"""

        soup = self.get_soup_from_url(f'https://wnacg.com/{url}')
        image_url = soup.select_one('#picarea').get('src')

        if image_url[:2] == '//':
            image_url = f'https:{image_url}'

        save_file(
            requests.get(image_url).content,
            f'{self.book_dir_path}/{file_index}.jpg'
        )

        logger.success(f'Success download index {file_index} image.')

    def get_image_page_urls(self, aid: str, page: str):
        """獲取頁面上圖片網址"""

        soup = self.get_soup_from_url(
            f'https://wnacg.com/photos-index-page-{page}-aid-{aid}.html'
        )

        image_divs = soup.select('div.pic_box.tb a')
        return [image_div.get('href').strip() for image_div in image_divs]

    def get_page_info(self, aid: str):
        """獲取基礎網址基礎資訊"""

        soup = self.get_soup_from_url(
            f'https://wnacg.com/photos-index-page-1-aid-{aid}.html'
        )

        if soup is None:
            return None, None

        title = soup.select_one('h2').text.strip()
        last_page_href = soup.select_one('div.f_left.paginator *:nth-last-child(2)')

        if last_page_href:
            pages_count = int(last_page_href.text.strip())
            return title, pages_count
        else:
            return title, 1

    def get_soup_from_url(self, url: str):
        response = get_response(url, 'GET')

        if response is None:
            return None

        return BeautifulSoup(response.content, 'html.parser')

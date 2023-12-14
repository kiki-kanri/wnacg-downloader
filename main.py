import re

from wnacg import Wnacg


def main():
    urls_string = input('請輸入網址或aid，多個請用空格分隔：').strip()
    urls = re.split(r'[\s]+', urls_string)
    wnacg = Wnacg()
    wnacg.start(urls)


if __name__ == '__main__':
    main()

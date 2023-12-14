import sys

from loguru import logger


logger.remove()


def add_logger_path(add_logger, path, colorize = False):
    add_logger.add(
        path,
        format='<level>{time:YYYY-MM-DD HH:mm:ss}｜{level}｜{message}</level>',
        colorize = colorize
    )


add_logger_path(logger, sys.stdout, True)

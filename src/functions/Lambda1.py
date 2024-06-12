import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    logger.info('Lambda 1 execution started')
    time.sleep(2.5)
    logger.info('Lambda 1 execution completed')
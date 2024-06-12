import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    logger.info('Lambda 3 execution started')
    logger.info('Lambda 3 execution completed')
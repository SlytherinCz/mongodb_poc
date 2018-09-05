import pika
from pika.exceptions import ChannelClosed
from pymongo import MongoClient
import json
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


EXCHANGE = "message"
EXCHANGE_TYPE = "topic"
QUEUE_NAME = "inbound"
ROUTING_KEY = "inbound"


def on_message(channel, method_frame, header_frame, body):
    mongos = MongoClient("mongodb://{}:{}@router1/surveys".format("writer", "writerPassword"))
    collection = mongos.surveys.results
    id = collection.insert(json.loads(body.decode("utf-8")))
    logger.info("stored message {}".format(id))
    channel.basic_ack(delivery_tag=method_frame.delivery_tag)
    mongos.close()


credentials = pika.PlainCredentials("bunny", "harepass")
parameters = pika.ConnectionParameters(host="rabbit", credentials=credentials)
connection = pika.BlockingConnection(parameters)
channel = connection.channel()
try:
    logger.info("checking whether exchange exists")
    channel.exchange_declare(exchange=EXCHANGE, exchange_type=EXCHANGE_TYPE, passive=True)
except ChannelClosed:
    channel = connection.channel()
    logger.info("trying to create exchange")
    channel.exchange_declare(exchange=EXCHANGE, exchange_type=EXCHANGE_TYPE)

try:
    logger.info("checking whether queue exists")
    channel.queue_declare(QUEUE_NAME, passive=True)
except ChannelClosed:
    channel = connection.channel()
    logger.info("trying to create queue")
    channel.queue_declare(QUEUE_NAME)
    logger.info("trying to bind queue")
    channel.queue_bind(QUEUE_NAME, EXCHANGE)

logger.info("starting to consume queue [{}] on exchange [{}]".format(QUEUE_NAME, EXCHANGE))
channel.basic_consume(on_message, ROUTING_KEY)

try:
    channel.start_consuming()
except KeyboardInterrupt:
    channel.stop_consuming()
connection.close()

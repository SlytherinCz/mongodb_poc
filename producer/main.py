import pika
import sys
import os
import random
import time

from pika.exceptions import ChannelClosed

document_count = int(sys.argv[1])

EXCHANGE = 'message'
EXCHANGE_TYPE = 'topic'
QUEUE_NAME = 'inbound'
ROUTING_KEY = 'inbound'

json_files = list(
    filter(lambda filename: os.path.isfile('{}/{}'.format('./documents/', filename)), os.listdir('./documents/')))

json_bodies = []
for file in json_files:
    with open('./documents/{}'.format(file)) as json_body:
        json_bodies.append(json_body.read())

credentials = pika.PlainCredentials('bunny', 'harepass')

parameters = pika.ConnectionParameters(host='rabbit', credentials=credentials)
connection = pika.BlockingConnection(parameters)

channel = connection.channel()
channel.exchange_declare(EXCHANGE, EXCHANGE_TYPE, passive=True)

channel.queue_declare(QUEUE_NAME, passive=True)
channel.queue_bind(QUEUE_NAME, EXCHANGE)

message_properties = pika.BasicProperties(app_id='test', content_type='application/json')

for i in range(0, document_count):
    channel.basic_publish(EXCHANGE, ROUTING_KEY, random.choice(json_bodies))
    time.sleep(0.005)

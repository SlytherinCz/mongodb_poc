const MongoClient = require('mongodb').MongoClient;
const amqp = require('amqplib');

const MONGO_URL = 'mongodb://router1:27017';
const DB_NAME = 'myproject';
const COLLECTION_NAME = 'surveys';

const QUEUE = 'inbound';
const EXCHANGE_NAME = 'message';
const RABBIT_URL = 'amqp://bunny:harepass@rabbit';

let connect_queue = amqp.connect(RABBIT_URL);

(async function () {


    let rabbit_connection = await amqp.connect(RABBIT_URL).catch(
        rabbit_connection_error => console.error(rabbit_connection_error)
    );

    let mongo = await MongoClient.connect(MONGO_URL).catch(
        mongo_connection_error => console.error(mongo_connection_error)
    );

    let channel = await rabbit_connection.createChannel();

    let queue_exists = await channel.assertQueue(QUEUE);
    let exchange_exists = await channel.assertExchange(EXCHANGE_NAME);

    channel.consume(QUEUE, async function (message) {
        console.info('consuming message');
        if (message !== null) {
            let result = await mongo.db(DB_NAME).collection(COLLECTION_NAME).insertOne(
                JSON.parse(message.content.toString())
            ).catch(
               insert_error => { console.error(insert_error);channel.nack(message); }
            )

            if (result.insertedId) {
                console.log(result.insertedId);
                channel.ack(message);
                }
            }
    })
})();

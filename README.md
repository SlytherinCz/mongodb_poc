# Simple RabbitMQ proof-of-concept 

## Disclaimer

This is a proof-of-concept stack, by no means is this meant to be used in any sort of production. 

As such: containerization and mainly the setup procedure is suboptimal 

## Get Started

### Prerequisites

* Docker
* docker-compose
* unbound port `8080`

### Setup 

First create external networks

```bash
docker network create queue
```

```bash
docker network create mongo
```

Then bring up the stack

```bash
docker-compose up -d
```

After that run the setup script

```bash
./setup.sh
```

Just to be sure, restart the applications on consumer container

```bash
docker exec -it consumer sh
pm2 restart app
pm2 restart overseer
```

### Testing 

Your local port `8080` is forwarded towards RabbitMQ admin webapp, use `bunny:harepass` as login

To produce traffic, run the script within producer container 

```bash
docker exec -it producer sh
python main.py <number-of-messages>
```

In RabbitMQ admin observe queue behavior and connections

You can also perform queues against Mongo, but that's out-of-scope for this POC




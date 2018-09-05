#!/usr/bin/env bash

docker exec -it config1 bash -c "echo \"$(cat ./init/config-init.js)\" | mongo"
docker exec -it replicaset1n1 bash -c "echo \"$(cat ./init/replicaset-init.js)\" | mongo"
echo "sleeping for 30 seconds"
sleep 30
echo "trying to configure shards on router"
docker exec -it router1 bash -c "echo \"$(cat ./init/router-init.js)\" | mongo"


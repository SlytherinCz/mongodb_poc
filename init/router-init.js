sh.addShard('rs1/replicaset1n1');
use surveys;
sh.enableSharding('surveys')
db.createCollection('surveys.results')
sh.shardCollection('surveys.results', {'survey_id' : 1})
db.createUser({
    user: 'writer',
    pwd: 'writerPassword',
    roles: [{ role: 'readWrite', db:'surveys'}]
})
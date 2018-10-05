const pm2Api = require('pm2/lib/API');
const axios = require('axios');
const process = require('process');

const perProcessThreshold = 1000;
const maximumProcessCount = 10;
const queue_check_url = 'http://bunny:harepass@rabbit:15672/api/queues/%2F/inbound';


let pm2 = new pm2Api();

setInterval(function(){
    pm2.connect( async (err) =>  {
        pm2.describe('app', async (err,data) => {
            if(err === null){
                let runningProcessCount = data.length;
                let messageCount = 1;


                response = await axios.get(queue_check_url);

                if(response.data.hasOwnProperty('messages')){
                    messageCount = response.data.messages;
                } else {
                    console.warn('Cannot read message count');
                    messageCount = 0;
                }

                console.info('Queue is currently consumed by '+runningProcessCount+' processes');
                console.info('Queue currently has '+ messageCount +' messages');

                if(messageCount/runningProcessCount > perProcessThreshold)
                {
                    console.info('Current per process ratio is larger than defined threshold ' + perProcessThreshold);
                    if(runningProcessCount === maximumProcessCount){
                        console.warn('Reached maximum allowed process count, queue is still filling');
                    } else {
                        let optimalNewProcesses = (messageCount/runningProcessCount) / perProcessThreshold;
                        if (optimalNewProcesses + runningProcessCount > maximumProcessCount){
                            optimalNewProcesses = maximumProcessCount - runningProcessCount;
                        }
                        console.info('Scaling up from '+runningProcessCount+' processes to ' + (optimalNewProcesses + runningProcessCount) +  ' processes')
                        pm2.scale('app', '+' + optimalNewProcesses, (err,data) => {
                            console.log(data);
                            console.error(err);
                            pm2.disconnect();
                        })
                    }
                }

                if(messageCount < perProcessThreshold * runningProcessCount && runningProcessCount > 1){
                    console.info('Scaling down by one');
                    pm2.scale('app', runningProcessCount - 1, (err,data) => {
                        console.log(data);
                        console.error(err);
                        pm2.disconnect();
                    })
                }

            } else {
                console.error(err)
            }
        })
    })
},5000);
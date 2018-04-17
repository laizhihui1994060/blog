let redis   = require('redis');
let config   = require('../../config/config').redis;
let clientServer  = redis.createClient(config.post,config.host,{
    auth_pass:config.auth_pass
});

clientServer.on('ready',()=>{
    console.log('redis ready');
});
clientServer.on('error',(e)=>{
    console.log('redis error',e);
});
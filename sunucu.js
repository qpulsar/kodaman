 var server=require('node-http-server');
 console.log(server);

server.deploy(
    {
        verbose: true,
        port: 8000,
        root:__dirname+'/kod_klasor/'
    }
);

/* sample1.js */

var http = require('http');

var myserver = http.createServer().listen(1337, '127.0.0.1');

myserver.on('request',function(request,response) { 
	response.writeHead(200, {'Content-Type': 'text/plain'});
	var r = require('url').parse(request.url,true);
    let data = { "name":"toto", "content":[
        { "name":"ruba", "value":"rubrique A" },
        { "name":"rubb", "value":"rubrique B" }
    ]}
	response.end(JSON.stringify(data));
});

console.log('Server running at http://127.0.0.1:1337/');
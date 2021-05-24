/* sample.js */

var http = require('http');

var myserver = http.createServer().listen(1337, '127.0.0.1');

myserver.on('request',function(request,response) { 
	response.writeHead(200, {'Content-Type': 'text/plain'});
    let data = undefined
    switch(request.url) {
        case '/mock':
            data = { "name":"toto", "content":[
            { "name":"ruba", "value":"rubrique A" },
            { "name":"rubb", "value":"rubrique B" }
            ]}
            response.writeHead(200)
            response.end(JSON.stringify(data))
            break
        case '/optlist':
            data = ["un","deux","trois","quatre"]
            response.writeHead(200)
            response.end(JSON.stringify(data))
            break
        case '/optlist?table=un':
            data = ["rubUnA","rubUnB","rubUnC"]
            response.writeHead(200)
            response.end(JSON.stringify(data))
            break
        case '/optlist?table=deux':
            data = ["rubDeuxA","rubDeuxB"]
            response.writeHead(200)
            response.end(JSON.stringify(data))
            break
        case '/optlist?table=quatre':
            data = ["rubQuatreA","rubQuatreB","rubQuatreC","rubQuatreD","rubQuatreE"]
            response.writeHead(200)
            response.end(JSON.stringify(data))
            break
        default:
            response.writeHead(404)
            response.end(JSON.stringify({error:"service not found"}))
            break
    }
});

console.log('Server running at http://127.0.0.1:1337/');
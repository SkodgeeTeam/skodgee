const https = require('https')

service = function(request) {
    return new Promise(
        (resolve,reject) => {
            let data = ''
            https.get(request,(res)=>{
                if(res.statusCode!==200) {
                    reject(res)
                    res.resume()
                }
                res.on('data',c=>data+=c)
                res.on('close',()=>resolve(data))
            }).on('error',(error)=>{
                reject(error)
            })
        }
    )
}

const http = require('http');

var myserver = http.createServer().listen(1337, '127.0.0.1');

myserver.on('request',function(request,response) { 
    switch(true) {
        case request.url==='/regions':
            try {                
                service('https://geo.api.gouv.fr/regions?fields=nom,code')
                .then(data => {
                    response.writeHead(200, {'Content-Type': 'text/plain'})
                    response.end(JSON.stringify(JSON.parse(data).map(e=>{ return {key:e.code,val:e.nom} })))
                })
            } catch(error) {
                response.writeHead(400)
                response.end(JSON.stringify({error:"service not found"}))
            }
            break
        case /^\/regions\/\d{2}\/departements$/.test(request.url) :
            try {
                service(`https://geo.api.gouv.fr${request.url}?fields=nom,code`)
                .then(data => {
                    response.writeHead(200, {'Content-Type': 'text/plain'})
                    response.end(JSON.stringify(JSON.parse(data).map(e=>{ return {key:e.code,val:e.nom} })))
                })
            } catch(error) {
                response.writeHead(400)
                response.end(JSON.stringify({error:"service not found"}))
            }
            break
        case /^\/departements\/\d{2}\/communes$/.test(request.url) :
            try {
                service(`https://geo.api.gouv.fr${request.url}?fields=nom,code`)
                .then(data => {
                    response.writeHead(200, {'Content-Type': 'text/plain'})
                    response.end(JSON.stringify(JSON.parse(data).map(e=>{ return {key:e.code,val:e.nom} })))
                })
            } catch(error) {
                response.writeHead(400)
                response.end(JSON.stringify({error:"service not found"}))
            }
            break
        default :
            response.writeHead(404)
            response.end(JSON.stringify({error:"service not found"}))
    }
})

console.log('Server running at http://127.0.0.1:1337/');
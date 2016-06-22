var http = require('http')
var fs = require('fs')
var path = require('path')
var crypto = require('crypto')

var rgx = /^\/bytes\/([0-9]{1,4})\/(base64|hex)$/i

function requestListener (req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, {'Allow': 'GET', 'Content-Type': 'text/plain'})
    res.end('Method Not Allowed: ' + req.method)
    return
  }

  if (req.url === '/') {
    var indexFile = fs.createReadStream(path.join(__dirname, 'index.html'), 'utf8')
    res.writeHead(200, {'Content-Type': 'text/html'})
    indexFile.pipe(res)
    return
  }

  if (!rgx.test(req.url)) {
    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.end('Not Found: ' + req.url)
    return
  }

  var parts = req.url.match(rgx)
  var count = parseInt(parts[1], 10)
  var format = parts[2].toLowerCase()

  if (isNaN(count) || count < 1) {
    res.writeHead(400, {'Content-Type': 'text/plain'})
    res.end('Bad Request: Byte count must be an integer and greater than 1')
    return
  }

  crypto.randomBytes(count, function (err, buffer) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'})
      res.end('Server Error: ' + err.message)
      return
    }

    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(buffer.toString(format))
  })
}

http.createServer(requestListener).listen(process.env.PORT || 3000)

const http = require('http')
const https = require('https')
const url = require('url')

module.exports = function proxyServer(
  targetServerHost, targetServerPort
) {
  const server = http.createServer((req, res) => {
    let reqUrl = req.url
    if (req.url === '/') {
      reqUrl = ''
    }
    res.writeHead(301, {
      'Location': `https://${targetServerHost}:${targetServerPort}${reqUrl}`
    })
    if (!res.writableEnded && !res.destroyed) {
      console.log('okokoko')
      res.end()
    }
  })
  return function serverListener() {
    server.listen(80, targetServerHost, () => {
      console.log(`HTTP proxy server running at http://0.0.0.0:80`)
    })
  }
}

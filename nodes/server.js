const http2 = require('http2')
const fs = require('fs')
const domain = require('domain')
const tls = require('tls')
const cluster = require('cluster')

const handleRequests = require('./handleRequests')
const constructDomain = require('./constructDomain')
const setupFileLogging = require('./setupFileLogging')

module.exports = function server(app) {
  app.config = app.config || {}

  app.config.key = app.config.key || 'key.pem'
  app.config.cert = app.config.cert || 'cert.pem'
  app.config.host = app.config.host || 'localhost'
  app.config.port = app.config.port || 8004
  
  if (app.logFile) {
    setupFileLogging(app.logFile)
  }

  const server = http2.createSecureServer({
    key: fs.readFileSync(app.config.key),
    cert: fs.readFileSync(app.config.cert),
    SNICallback: (servername, callback) => {
      const ctx = tls.createSecureContext({
        key: fs.readFileSync(app.config.key),
        cert: fs.readFileSync(app.config.cert)
      })
      callback(null, ctx)
    }
  })

  server.on('stream', (stream, headers) => {
    constructDomain(server, stream).run(async () => {
      await handleRequests(app, stream, headers)
    })
  })

  process.on('exit', () => {
    if (server.listening) {
      console.log(`server on worker ${process.pid} is about to be closed`)
      server.close()
    }
  })

  process.on('message', (message) => {
    if (message === 'Message from Primary Process: Exit your process with code 0 to restart it again.') {
      process.exit(0)
    }
  })
  
  return function serverListener() {
    server.listen(app.config.port, app.config.host, () => {
      console.log(`HTTP/2 server running at https://${app.config.host}:${app.config.port}`)
    })
  }
}

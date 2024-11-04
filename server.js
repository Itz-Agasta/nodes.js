const http2 = require('http2')
const fs = require('fs')

module.exports = function server(app) {
  app.config = app.config || {}

  app.config.key = app.config.key || 'key.pem'
  app.config.cert = app.config.cert || 'cert.pem'
  app.config.host = app.config.host || 'localhost'
  app.config.port = app.config.port || 8004
  
  const server = http2.createSecureServer({
    key: fs.readFileSync(app.config.key),
    cert: fs.readFileSync(app.config.cert),
  })

  server.on('stream', (stream, headers) => {
    app.api[0].handler({
      stream, headers,
      config: app.config,
      secrets: app.secrets,
      deps: app.deps
    })
  })
  
  return function serverListener() {
    server.listen(app.config.port, app.config.host, () => {
      console.log(`HTTP/2 server running at https://${app.config.host}:${app.config.port}`);
    })
  }
}

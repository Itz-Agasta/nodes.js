const http2 = require('http2')
const fs = require('fs')

const defaultNotAllowedEndpointHandler = require('./defaultNotAllowedEndpointHandler.js')

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
    const requestUrl = headers[':path']
    const requestMethod = headers[':method']
    const allEndpointsInApp = app.api || []
    let matchedEndpoint = allEndpointsInApp.find(endpoint => {
      return isEndpointMatchedWithRequestUrlAndMethod(endpoint, requestUrl, requestMethod)
    })
    if (matchedEndpoint) {
      matchedEndpoint.handler({
        stream, headers,
        config: app.config,
        secrets: app.secrets,
        deps: app.deps
      })
    }
    if (!matchedEndpoint) {
      // TODO: try to server static files if possible

      const notAllowedEndpoint = allEndpointsInApp.find(endpoint => {
        return endpoint.type && endpoint.type === 'nowAllowed'
      })
      if (notAllowedEndpoint) {
        matchedEndpoint.handler({
          stream, headers,
          config: app.config,
          secrets: app.secrets,
          deps: app.deps
        })
      } else {
        defaultNotAllowedEndpointHandler({
          stream
        })
      }
    }
  })
  
  return function serverListener() {
    server.listen(app.config.port, app.config.host, () => {
      console.log(`HTTP/2 server running at https://${app.config.host}:${app.config.port}`);
    })
  }
}

function isEndpointMatchedWithRequestUrlAndMethod(endpoint, requestUrl, requestMethod) {
  let match = false
  if (endpoint.method) {
    endpoint.method = endpoint.method.trim()
    const methodIsIncluded = endpoint.method.split(',').filter(t => t.trim() === requestMethod).length > 0
    const urlFitsRegexp = endpoint.regexpUrl.test(requestUrl)
    match = methodIsIncluded && urlFitsRegexp
  } else {
    match = endpoint.regexpUrl.test(requestUrl)
  }
  return match
}

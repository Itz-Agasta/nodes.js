const allowedOrigin = require('./allowedOrigin')

// can be in static, and in api
module.exports = function cors(regexpUrl, {
  allowedOrigins,
  allowedMethods,
  allowedHeaders,
  allowedCredentials,
  maxAge
} = {}) {
  return {
    regexpUrl,
    method: 'OPTIONS',
    handler: endpointHandler({
      allowedOrigins,
      allowedMethods,
      allowedHeaders,
      allowedCredentials,
      maxAge
    }),
    type: 'cors'
  }
}

function endpointHandler({
  allowedOrigins,
  allowedMethods,
  allowedHeaders,
  allowedCredentials,
  maxAge
}) {
  return function handler({
    stream,
    headers
  }) {
    const requestOrigin = headers['origin']
    const requestHost = headers['host']
    const responseHeaders = {}
    responseHeaders['access-control-allow-origin'] = allowedOrigin(allowedOrigins, requestOrigin, requestHost)
    if (allowedMethods) {
      responseHeaders['access-control-allow-methods'] = allowedMethods.join(', ')
    } else {
      responseHeaders['access-control-allow-methods'] = 'GET, OPTIONS'
    }
    if (allowedHeaders) {
      responseHeaders['access-control-allow-headers'] = allowedHeaders.join(', ')
    } else {
      responseHeaders['access-control-allow-headers'] = Object.keys(headers).join(', ')
    }
    if (allowedCredentials) {
      responseHeaders['access-control-allow-credentials'] = true
    }
    if (maxAge) {
      responseHeaders['access-control-max-age'] = maxAge
    }
    responseHeaders['status'] = 200
    stream.respond(responseHeaders)
    stream.end()
  }
}

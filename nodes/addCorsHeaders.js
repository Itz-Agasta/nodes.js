module.exports = function addCorsHeaders(responseHeaders, {
  allowedOrigins,
  allowedMethods,
  allowedHeaders,
  allowedCredentials,
  maxAge
} = {}) {
  if (allowedOrigins) {
    responseHeaders['access-control-allow-origin'] = allowedOrigin(
      allowedOrigins,
      requestOrigin,
      requestHost
    )
    if (allowedMethods) {
      responseHeaders['access-control-allow-methods'] = allowedMethods.join(', ')
    } else {
      responseHeaders['access-control-allow-methods'] = 'GET,OPTIONS'
    }
    if (allowedHeaders) {
      responseHeaders['access-control-allow-headers'] = allowedHeaders.join(', ')
    } else {
      responseHeaders['access-control-allow-headers'] = '*'
    }
    if (allowedCredentials) {
      responseHeaders['access-control-allow-credentials'] = true
    }
    if (maxAge) {
      responseHeaders['access-control-max-age'] = maxAge
    }
  }
}

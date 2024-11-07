module.exports = function endpoint(urlPattern, method, handler) {
  return {
    urlPattern,
    method,
    handler,
    type: 'endpoint'
  }
}

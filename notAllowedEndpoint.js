module.exports = function endpoint(regexpUrl, method, handler) {
  return {
    regexpUrl,
    method,
    handler,
    type: 'notAllowed'
  }
}

module.exports = function endpoint(regexp, method, handler) {
  return {
    regexp,
    method,
    handler
  }
}

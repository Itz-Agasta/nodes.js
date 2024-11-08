module.exports = function app({
  config,
  api,
  static,
  logFile,
  deps
}) {
  return {
    config,
    api,
    static,
    logFile,
    deps
  }
}

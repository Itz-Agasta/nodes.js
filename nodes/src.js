module.exports = function src(regexpUrl, mapper, {
  fileNotFound,
  fileNotAccessible,
  allowedOrigins,
  useGzip,
  cacheControl
} = {}) {
  return {
    regexpUrl,
    mapper,
    fileNotFound,
    fileNotAccessible,
    allowedOrigins,
    useGzip,
    cacheControl,
    type: 'src'
  }
}

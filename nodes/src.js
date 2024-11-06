module.exports = function src(regexpUrl, mapper, {
  fileNotFound,
  fileNotAccessible,
  useGzip,
  cacheControl,
  allowedOrigins,
  allowedMethods,
  allowedHeaders,
  allowedCredentials,
  maxAge
} = {}) {
  return {
    regexpUrl,
    mapper,
    fileNotFound,
    fileNotAccessible,
    useGzip,
    cacheControl,
    allowedOrigins,
    allowedMethods,
    allowedHeaders,
    allowedCredentials,
    maxAge
  }
}

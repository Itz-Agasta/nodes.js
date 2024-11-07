module.exports = function src(urlPattern, mapper, {
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
    urlPattern,
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

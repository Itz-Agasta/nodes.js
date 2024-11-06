const zlib = require('zlib')
const fs = require('fs')

const allowedOrigin = require('./allowedOrigin')
const mimeType = require('./mimeType')

module.exports = function streamFile(file, stream, requestOrigin, requestHost, stats, status, useGzip, cacheControl, lastModified, allowedOrigins) {
  const gzip = zlib.createGzip()
  const mappedMimeType = mimeType(file)
  const responseHeaders = {
    'content-type': mappedMimeType,
    'content-length': stats.size,
    ':status': status
  }
  if (useGzip) {
    responseHeaders['content-encoding'] = 'gzip'
  }
  if (cacheControl) {
    responseHeaders['cache-control'] = cacheControl
    responseHeaders['last-modified'] = lastModified
  }
  if (allowedOrigins) {
    responseHeaders['access-control-allow-origin'] = allowedOrigin(
      allowedOrigins,
      requestOrigin,
      requestHost
    )
  }
  stream.respond(responseHeaders)
  const readStream = fs.createReadStream(file, {
    encoding: 'utf8',
    highWaterMark: 1024
  })
  let gzipOptionalStream = readStream
  if (useGzip) {
    gzipOptionalStream = readStream.pipe(gzip)
  }
  gzipOptionalStream.pipe(stream)
}

const fs = require('fs')

const isEndpointMatchedWithRequestUrlAndMethod = require('./isEndpointMatchedWithRequestUrlAndMethod')
const isSrcMatchedWithRequestUrl = require('./isSrcMatchedWithRequestUrl')
const defaultSrcNotFoundHandler = require('./defaultSrcNotFoundHandler')
const defaultSrcNotAccessibleHandler = require('./defaultSrcNotAccessibleHandler')
const defaultEndpointNotAllowedHandler = require('./defaultEndpointNotAllowedHandler')
const defaultSrcMapper = require('./defaultSrcMapper')
const streamFile = require('./streamFile')

module.exports = async function handleRequests(app, stream, headers) {
  const requestUrl = headers[':path']
  const requestMethod = headers[':method']
  const requestOrigin = headers['origin']
  const requestHost = headers['host']

  const allEndpointsInApp = app.api || []
  const allSrcInApp = app.static || []
  const matchedEndpoint = allEndpointsInApp.find(endpoint => {
    return isEndpointMatchedWithRequestUrlAndMethod(endpoint, requestUrl, requestMethod)
  })
  if (matchedEndpoint) {
    if (matchedEndpoint.type === 'cors') {
      matchedEndpoint.handler({
        stream, headers
      })
    } else {
      await matchedEndpoint.handler({
        stream, headers,
        allowedOrigins: matchedEndpoint.allowedOrigins,
        config: app.config,
        secrets: app.secrets,
        deps: app.deps
      })
    }
  } else {
    const matchedSrc = allSrcInApp.find(src => {
      return isSrcMatchedWithRequestUrl(src, requestUrl, requestMethod)
    })
    if (matchedSrc) {
      if (matchedSrc.type === 'cors') {
        matchedSrc.handler({
          stream, headers
        })
      } else {
        const srcMapper = matchedSrc.mapper || defaultSrcMapper
        const resolvedFilePath = srcMapper(requestUrl, srcMapper)
        fs.stat(resolvedFilePath, async (err, stats) => {
          if (err) {
            if (err.code === 'ENOENT') {
              const fileNotFound = matchedSrc.fileNotFound
              if (!fileNotFound) {
                await defaultSrcNotFoundHandler({
                  stream
                })
              } else {
                fs.stat(fileNotFound, async (err, stats) => {
                  if (err) {
                    if (err.code === 'ENOENT') {
                      await defaultSrcNotFoundHandler({
                        stream
                      })
                    } else {
                      await defaultSrcNotAccessibleHandler({
                        stream
                      })
                    }
                  } else {
                    const useGzip = matchedSrc.useGzip || false
                    const cacheControl = matchedSrc.cacheControl || false
                    const lastModified = stats.mtime.toUTCString()
                    const allowedOrigins = matchedSrc.allowedOrigins || {}
                    streamFile(fileNotFound, stream, requestOrigin, requestHost, stats, 404, useGzip, cacheControl, lastModified, allowedOrigins)
                  }
                })
              }
            } else {
              const fileNotAccessible = matchedSrc.fileNotAccessible
              if (!fileNotAccessible) {
                await defaultSrcNotAccessibleHandler({
                  stream
                })
              } else {
                fs.stats(fileNotAccessible, async (err, stats) => {
                  if (err) {
                    if (err.code === 'ENOENT') {
                      await defaultSrcNotFoundHandler({
                        stream
                      })
                    } else {
                      await defaultSrcNotAccessibleHandler({
                        stream
                      })
                    }
                  } else {
                    const useGzip = matchedSrc.useGzip || false
                    const cacheControl = matchedSrc.cacheControl || false
                    const lastModified = stats.mtime.toUTCString()
                    const allowedOrigins = matchedSrc.allowedOrigins || {}
                    streamFile(fileNotAccessible, stream, requestOrigin, requestHost, stats, 403, useGzip, cacheControl, lastModified, allowedOrigins)
                  }
                })
              }
            }
          } else {
            const useGzip = matchedSrc.useGzip || false
            const cacheControl = matchedSrc.cacheControl || false
            const lastModified = stats.mtime.toUTCString()
            const allowedOrigins = matchedSrc.allowedOrigins || {}
            streamFile(resolvedFilePath, stream, requestOrigin, requestHost, stats, 200, useGzip, cacheControl, lastModified, allowedOrigins)
          }
        })
      }
    } else {
      await defaultEndpointNotAllowedHandler({
        stream
      })
    }
  }
}
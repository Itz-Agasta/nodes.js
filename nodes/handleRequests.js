const fs = require('fs')

const isEndpointMatchedWithRequestUrlAndMethod = require('./isEndpointMatchedWithRequestUrlAndMethod')
const isSrcMatchedWithRequestUrl = require('./isSrcMatchedWithRequestUrl')
const urlParamsAndQueries = require('./urlParamsAndQueries')
const defaultSrcNotFoundHandler = require('./defaultSrcNotFoundHandler')
const defaultSrcNotAccessibleHandler = require('./defaultSrcNotAccessibleHandler')
const defaultEndpointNotAllowedHandler = require('./defaultEndpointNotAllowedHandler')
const defaultSrcMapper = require('./defaultSrcMapper')
const streamFile = require('./streamFile')
const corsHandler = require('./corsHandler')
const addCorsHeaders = require('./addCorsHeaders')

module.exports = async function handleRequests(app, stream, headers) {
  const requestUrl = headers[':path']
  const requestMethod = headers[':method']
  const requestOrigin = headers['origin']
  const requestHost = headers['host']

  const allEndpointsInApp = app.api || []
  const allSrcInApp = app.static || []

  if (app.indexFile && requestMethod === 'GET' && (requestUrl === '/' || requestUrl === '')) {
    fs.stat(app.indexFile, (err, stats) => {
      if (err) {
        throw err
      }
      streamFile(
        app.indexFile,
        stream,
        requestMethod,
        requestOrigin,
        requestHost,
        stats,
        200
      )
    })
    return
  }

  const matchedEndpoint = allEndpointsInApp.find(endpoint => {
    return isEndpointMatchedWithRequestUrlAndMethod(endpoint, requestUrl, requestMethod)
  })

  if (matchedEndpoint) {
    const { params, queries } = urlParamsAndQueries(matchedEndpoint.urlPattern, requestUrl)
    const allowedOrigins = matchedEndpoint.allowedOrigins
    const allowedMethods = matchedEndpoint.allowedOrigins
    const allowedHeaders = matchedEndpoint.allowedOrigins
    const allowedCredentials = matchedEndpoint.allowedOrigins
    const maxAge = matchedEndpoint.allowedOrigins
    if (requestMethod === 'OPTIONS' && allowedOrigins) {
      corsHandler({
        stream, headers,
        allowedOrigins,
        requestOrigin,
        requestHost,
        requestMethod,
      })
    } else {
      if (allowedOrigins) {
        const originalStreamRespond = stream.respond
        stream.respond = function respondWithCors(headers) {
          addCorsHeaders(headers, {
            allowedOrigins,
            allowedMethods,
            allowedHeaders,
            allowedCredentials,
            maxAge
          })
          originalStreamRespond.call(stream, headers)
        }
      }
      await matchedEndpoint.handler({
        stream, headers,
        params, queries,
        config: app.config,
        deps: app.deps
      })
    }
  } else {
    const matchedSrc = allSrcInApp.find(src => {
      return isSrcMatchedWithRequestUrl(src, requestUrl, requestMethod)
    })
    if (matchedSrc) {
      const srcMapper = matchedSrc.mapper || defaultSrcMapper
      const resolvedFilePath = srcMapper(requestUrl)
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
                  const allowedMethods = matchedSrc.allowedMethods || []
                  const allowedHeaders = matchedSrc.allowedHeaders || []
                  const allowedCredentials = matchedSrc.allowedCredentials || false
                  const maxAge = matchedSrc.maxAge || undefined
                  streamFile(
                    fileNotFound,
                    stream,
                    requestMethod,
                    requestOrigin,
                    requestHost,
                    stats,
                    404,
                    useGzip,
                    cacheControl,
                    lastModified,
                    allowedOrigins,
                    allowedMethods,
                    allowedHeaders,
                    allowedCredentials,
                    maxAge
                  )
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
                  const allowedMethods = matchedSrc.allowedMethods || []
                  const allowedHeaders = matchedSrc.allowedHeaders || []
                  const allowedCredentials = matchedSrc.allowedCredentials || false
                  const maxAge = matchedSrc.maxAge || undefined
                  streamFile(
                    fileNotAccessible,
                    stream,
                    requestMethod,
                    requestOrigin,
                    requestHost,
                    stats,
                    403,
                    useGzip,
                    cacheControl,
                    lastModified,
                    allowedOrigins,
                    allowedMethods,
                    allowedHeaders,
                    allowedCredentials,
                    maxAge
                  )
                }
              })
            }
          }
        } else {
          const useGzip = matchedSrc.useGzip || false
          const cacheControl = matchedSrc.cacheControl || false
          const lastModified = stats.mtime.toUTCString()
          const allowedOrigins = matchedSrc.allowedOrigins || {}
          const allowedMethods = matchedSrc.allowedMethods || []
          const allowedHeaders = matchedSrc.allowedHeaders || []
          const allowedCredentials = matchedSrc.allowedCredentials || false
          const maxAge = matchedSrc.maxAge || undefined
          streamFile(
            resolvedFilePath,
            stream,
            requestMethod,
            requestOrigin,
            requestHost,
            stats,
            200,
            useGzip,
            cacheControl,
            lastModified,
            allowedOrigins,
            allowedMethods,
            allowedHeaders,
            allowedCredentials,
            maxAge
          )
        }
      })
    } else {
      await defaultEndpointNotAllowedHandler({
        stream
      })
    }
  }
}
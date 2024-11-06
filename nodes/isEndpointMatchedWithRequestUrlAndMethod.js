module.exports = function isEndpointMatchedWithRequestUrlAndMethod(endpoint, requestUrl, requestMethod) {
  let match = false
  if (endpoint.method && requestMethod) {
    endpoint.method = endpoint.method.trim()
    const isEndpointCors = endpoint.allowedOrigins !== undefined
    if (isEndpointCors) {
      endpoint.method += ',OPTIONS'
    }
    const methodIsIncluded = endpoint.method.split(',').filter(t => t.trim() === requestMethod).length > 0
    const urlFitsRegexp = endpoint.regexpUrl.test(requestUrl)
    match = methodIsIncluded && urlFitsRegexp
  } else {
    match = endpoint.regexpUrl.test(requestUrl)
  }
  return match
}

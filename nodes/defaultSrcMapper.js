const path = require('path')

module.exports = function defaultSrcMapper(requestUrl) {
  const parts = requestUrl.split('?')[0].split('/').filter(part => part !== '')
  return path.join(...parts)
}

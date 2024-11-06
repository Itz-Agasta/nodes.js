const path = require('path')

module.exports = function htmlMapper(requestUrl) {
  const parts = requestUrl.split('?')[0].split('/').filter(part => part !== '')
  return path.join('example', 'static', ...parts)
}

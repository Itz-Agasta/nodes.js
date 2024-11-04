module.exports = function index({
  stream,
  headers,
  config,
  secrets,
  deps
}) {
  stream.respond({
    'content-type': 'text/plain',
    'status': 200
  })
  stream.end('This is index page')
}
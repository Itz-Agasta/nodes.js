module.exports = async function index({
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
  stream.end(`This is index page with headers ${JSON.stringify(headers)}`)
}

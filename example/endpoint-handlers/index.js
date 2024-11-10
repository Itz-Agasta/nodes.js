module.exports = async function index({
  stream,
  headers,
  config,
  deps
}) {
  console.log({
    headers,
    config,
    deps
  })
  stream.respond({
    'content-type': 'text/plain',
    'status': 200
  })
  stream.end(`3) This is index page with headers ${JSON.stringify(headers)}`)
}

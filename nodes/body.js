module.exports = function body(stream) {
  return new Promise((resolve, reject) => {
    const body = []
    stream.on('data', (chunk) => {
      body.push(chunk)
    })
    stream.on('end', () => {
      resolve(Buffer.concat(body))
    })
    stream.on('error', (err) => {
      reject(err)
    })
  })
}

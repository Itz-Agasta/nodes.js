console.log('this is executed in worker process', process.pid)

const fs = require('fs')

const server = require('./../nodes/server')
const app = require('./../nodes/app')
const endpoint = require('./../nodes/endpoint')
const src = require('./../nodes/src')
const body = require('./../nodes/body')

const {
  index
} = require('./endpoint-handlers/export')
const {
  html
} = require('./static-mappers/export')

process.env.ENV = process.env.ENV || 'local'

// TODO: 
// 1. Add global error handler via domain
//  1.1 Restart gracefully by server error 
// 2. Restart gracefully by signal

server(
  app({
    config: JSON.parse(
      fs.readFileSync(
        `./example/env/${process.env.ENV}.json`
      )
    ),
    api: [
      endpoint(/\/$/, 'GET', index),
      endpoint('/ok/:param?q1&q2', 'GET', async ({ stream, headers, params, queries }) => {
        const requestBody = await body(stream)
        console.log(JSON.parse(requestBody.toString()))
        stream.end(JSON.stringify({ message: 'ok', param: params['param'], query: [queries['q1'], queries['q2']] }))
      })
    ],
    static: [
      src(/^\/(html)/, html, {
        useGzip: true,
        // cacheControl: 'cache, public, max-age=432000',
        allowedOrigins: '*'
      })
    ],
    deps: {}
  })
)()

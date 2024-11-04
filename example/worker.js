console.log('this is executed in worker process', process.pid)

const fs = require('fs')
const server = require('./../server')
const app = require('./../app')
const api = require('./../api')
const endpoint = require('./../endpoint')
const static = require('./../static')

const {
  index
} = require('./endpoint-handlers/export')


process.env.ENV = process.env.ENV || 'local'

server(
  app({
    config: JSON.parse(fs.readFileSync(`./example/env/${process.env.ENV}.json`)),
    api: api([
      endpoint(/\/$/, 'GET', index)
    ]),
    static: static(),
    deps: {}
  })
)()

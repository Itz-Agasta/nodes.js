const cluster = require('./../cluster')

function masterFunction () {
  console.log('this is master')
}

function workerFunction () {
  console.log('this is worker')
}

cluster(masterFunction, workerFunction)()

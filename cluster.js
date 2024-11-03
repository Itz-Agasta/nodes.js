const os = require('os')
const cluster = require('cluster')

module.exports = (masterFunction, workerFunction, numCPUs) => {
  numCPUs = numCPUs || os.cpus().length

  return () => {
    if (cluster.isMaster) {
      masterFunction()
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died (${signal || code}). restarting...`)
        cluster.fork()
      })
    } else {
      workerFunction()
    }
  }
}

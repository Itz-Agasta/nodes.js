const os = require('os')
const path = require('path')
const cluster = require('cluster')

module.exports = function clusterRunner(masterScript, workerScript) {
  return (numCPUs) => {
    numCPUs = numCPUs || os.cpus().length
    if (cluster.isMaster) {
      const masterScriptPath = path.join(process.cwd(), masterScript)
      require(masterScriptPath)
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died (${signal || code}). restarting...`)
        cluster.fork()
      })
    } else {
      const workerScriptPath = path.join(process.cwd(), workerScript)
      require(workerScriptPath)
    }
  }
}

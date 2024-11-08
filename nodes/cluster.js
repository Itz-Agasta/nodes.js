const os = require('os')
const path = require('path')
const cluster = require('cluster')
const fs = require('fs')

const disconnectAndExitAllWorkersWithTimeoutRecursively = require('./disconnectAndExitAllWorkersWithTimeoutRecursively')
const clearRequireCache = require('./clearRequireCache')

const TIME_TO_WAIT_BEFORE_LOG_MESSAGE_ABOUT_RESTARTED_SUBPROCESSES = 6500

module.exports = function clusterRunner(masterScript, workerScript) {
  return (numCPUs) => {
    numCPUs = numCPUs || os.cpus().length
    if (cluster.isPrimary) {
      fs.writeFileSync('master.pid', process.pid.toString(), 'utf8')

      const masterScriptPath = path.join(process.cwd(), masterScript)
      require(masterScriptPath)
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died (${signal || code}). restarting...`)
        cluster.fork()
      })

      process.on('SIGINT', () => {
        fs.unlinkSync('master.pid')
        process.exit()
      })

      process.on('SIGUSR1', () => {
        const allWorkers = Object.values(cluster.workers)
        disconnectAndExitAllWorkersWithTimeoutRecursively(allWorkers, 0, (error, allWorkers) => {
          setTimeout(() => {
            if (error) {
              console.log(error)
            }
            // To be sure message will be dispalyed after all workers are restarted.
            console.log('All workers are restarted successfully (gracefully and recursively with timeout).')
          }, TIME_TO_WAIT_BEFORE_LOG_MESSAGE_ABOUT_RESTARTED_SUBPROCESSES)
        })
      })

    } else {
      console.log('worker is here:', process.pid)
      const workerScriptPath = path.join(process.cwd(), workerScript)
      require(workerScriptPath)
    }
  }
}


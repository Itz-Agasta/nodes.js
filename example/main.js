const cluster = require('./../cluster')

cluster('example/master.js', 'example/worker.js')()

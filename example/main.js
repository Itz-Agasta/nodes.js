const cluster = require('./../nodes/cluster')

cluster('example/master.js', 'example/worker.js')()

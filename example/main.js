const cluster = require('./../nodes/cluster')
const path = require('path')

cluster('example/master.js', 'example/worker.js')(2)

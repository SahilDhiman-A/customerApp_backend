/**
 *@file
 *This file is the entry point for the system. It defines the
 *Server we are running. It runs an async utility(waterfall)
 *and initializes server in the following order
 *  1) Initiate the db that is going to be used.
 *  2) Initiate the server
 *  3) Initiate the routes on the server
 *  4) Start listening the server
 *@requires async
 *@requires module:./Config.js
 *@requires module:./InitiateCalls.js
 *@author Affle Team
 */


import cluster from 'cluster'
import winston  from 'winston'
import log from './Public/Log.js'
import CONFIG from './Config/Config.js'
import async from 'async'
import initiateCalls from './Public/InitiateCalls.js'

global.SERVER = {};


if (cluster.isMaster) {
    console.log('info', 'Master is active, forking child process');
    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker) {
        console.error('Worker %s has died! Creating a new one.', worker.id);
        cluster.fork();
    });
    
} else {
    async.waterfall([function(callback) {
            initiateCalls.initiateDB(callback);
        },
        function(callback) {
            initiateCalls.initiateServer(callback);
        },
        function(callback) {
            initiateCalls.initiateRoutes(callback);
        },
        function(callback) {
            initiateCalls.initiateListen(callback);
        }
    ], function(error, data) {
        if (error) {
            console.log('some error occured');
            process.exit(0);
        }
    });
}
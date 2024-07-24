
/**
 * @desc This module is used to initiate the server running
 */

import winston from 'winston'
import mongoose from 'mongoose'
import errors from 'node-restify-errors'
import path from 'path'
import restify from 'restify'
import bunyan from 'bunyan'
import bodyParser from 'body-parser'
import responseTime from 'response-time'
import restifyValidation from 'node-restify-validation'
import CONFIG from '../Config/Config.js'
import LOG from './Log.js'

// var SERVER;

/**
 * @function initiateDB
 * @desc This function is used to make the intiale connection with the mongo server
 * @param {function} callback - Async utility callback function to mark the end of async process
 */

module.exports.initiateDB = function(callback) {
    var uristring = CONFIG.dbconfig.dbConnectionString;
    mongoose.Promise = global.Promise;
    mongoose.connect(uristring, {
        server: {
            socketOptions: {
                keepAlive: 300000,
                connectTimeoutMS: 30000
            }
        },
        auto_reconnect: true
    }, function(error, response) {
        if (error) {
            winston.error(error);
            callback(error);
        } else {
            callback(false);
        }
    });
    var db = mongoose.connection;
    db.on('connecting', function() {
        winston.log('info', 'MONGO-CONNECTING', {
            uristring: uristring,
            timeStamp: new Date().getTime()
        });
    });
    db.on('error', function(error) {
        console.error('Error in MongoDb connection: ' + error);
        mongoose.disconnect();
    });
    db.on('connected', function() {
        winston.log('info', 'MONGO-CONNECT', {
            uristring: uristring,
            timeStamp: new Date().getTime()
        });
    });
    db.once('open', function() {
        console.log('MongoDB connection opened!');
    });
    db.on('reconnected', function() {
        console.log('MongoDB reconnected!');
    });
    db.on('disconnected', function() {
        console.log('MongoDB disconnected!');
        mongoose.connect(uristring, {
            server: {
                auto_reconnect: true
            }
        });
    });
};

/**
 * @function initiateServer
 * @desc This function is used to start the server module with basic configuration. Even though the
 * function is not asynchronus still this has been kept in aysnc waterfall function to maintain consitency.
 * Change this if you find something better.
 *
 * @param {function} callback - Async utility callback function to mark the end of async process
 */

module.exports.initiateServer = function(callback) {
    SERVER = restify.createServer({
        log: bunyan.createLogger({
            name: 'myapp',
            serializers: {
                req: bunyan.stdSerializers.req
            }
        }),
        name: 'spectra - API',
        formatters: require('./JSONFormatter.js'),
        passphrase: '1234',
        requestCert: true,
        rejectUnauthorized: false,
        version: ['0.0.1'] // Default version for the API
    });
    SERVER.use(restify.authorizationParser());
    SERVER.use(bodyParser.urlencoded({
        extended: true
    }));
    SERVER.use(responseTime(function(req, res, time) {
        LOG.LOG('SERVER-RESPONSE', {
            method: req.method,
            url: req.url,
            time: time,
            contentType: res.contentType,
            code: res.code
        });
    }))
    SERVER.use(restify.queryParser());
    SERVER.use(bodyParser.json({parameterLimit: 100000,'limit':'50mb', extended: true}))
    SERVER.use(restifyValidation.validationPlugin({
        errorsAsArray: true,
        forbidUndefinedVariables: false,
        errorHandler: restify.errors.InvalidArgumentError
    }));
    SERVER.use(restify.dateParser());
    SERVER.use(restify.gzipResponse());
    SERVER.pre(function(request, response, next) {
        if (!request.headers['accept-version']) {
            request.headers['accept-version'] = CONFIG.defaultVersion;
        }
        LOG.LOG('SERVER-REQUEST', {
            url: request.url,
            method: request.method,
            info: request.info
        });
        if (mongoose.connection.readyState) {
            LOG.LOG('SERVER-REQUEST', {
                url: request.url,
                method: request.method,
                message: 'Mongo connected'
            });
            next();
        } else {
            LOG.LOG('SERVER-REQUEST', {
                error: true,
                url: request.url,
                method: request.method,
                message: 'Mongo Not connected'
            });
            var uristring = CONFIG.dbconfig.dbConnectionString;
            mongoose.Promise = global.Promise;
            mongoose.connect(uristring, {
                server: {
                    socketOptions: {
                        keepAlive: 300000,
                        connectTimeoutMS: 30000
                    },
                    auto_reconnect: true
                }
            }, function(error, response) {
                if (error) {
                    next(new errors('Not able to proces right now'));
                } else {
                    next();
                }
            });
        }
    });
    callback(false);
};

/**
 * @function initiateRoutes
 * @desc This function is used to initiate routes on the server
 * @param {function} callback - Async utility callback function to mark the end of async process
 */

module.exports.initiateRoutes = function(callback) {
    require('./Routes.js').initiateRoutes(callback);
};

/**
 * @function initiateListen
 * @desc This function is used to begin the server listening on respective port
 * @param {function} callback - Async utility callback function to mark the end of async process
 */

module.exports.initiateListen = function(callback) {
    SERVER.listen(process.env.PORT || CONFIG.test.PORT, function() {
        winston.log('info', 'SERVER-LISTEN', {
            port: process.env.PORT || CONFIG.test.PORT,
            timeStamp: new Date().getTime()
        });
    });
    callback(false);
};

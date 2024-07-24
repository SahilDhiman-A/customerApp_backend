
/**
 * @module LOG
 * @desc
 * This is the server Logger. This module is used to log System message
 * @requires winston
 */
 
var winston = require('winston');
module.exports.LOG = function(message, object) {
    object.timeStamp = new Date().getTime();
    object.date = new Date();
    if (object.error) {
        winston.log('error', message, object);
    } else {
        winston.log('info', message, object);
    }
};
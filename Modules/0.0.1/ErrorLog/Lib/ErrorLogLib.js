

var mongoose = require('mongoose');
var errors = require('node-restify-errors');
var path = require('path');


var getErrorLogModel = function() {
    var errorLogSchema = require('../Schema/ErrorLogSchema.js');
    var errorLog = mongoose.model('errorLog-' + path.basename(path.dirname(path.dirname(__dirname))), errorLogSchema);
    return errorLog;
};
var createErrorLog = function(errorData) {
    newErrLog = getErrorLogModel()(errorData);
    newErrLog.save(function(error, response) {
        if (error) {
            console.log("error=", error);
        } else {
            console.log("result", response);
        }
    });
  

};
module.exports = {
    createErrorLog: createErrorLog
}
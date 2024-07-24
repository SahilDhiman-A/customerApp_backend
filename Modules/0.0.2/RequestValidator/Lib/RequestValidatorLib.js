
var errorLogLib = require('../../ErrorLog/Lib/ErrorLogLib.js');
var uuidLib = require('uuid');
var errors = require('node-restify-errors');

/**
 * This function is used to validate, wheather request is URLEncoded Request. If it is not restify will throw a 
 * BadMethod error.
 */
/**
 * This function is used to validate, wheather request is JSON Request. If it is not restify will throw a 
 * BadMethod error.
 */
var jsonPost = function() {
    return function(request, response, next) {
        if (!request.is('application/json')) {
            var errorData = {
                'userId' : request.headers.userId,
                'method' : request.method,
                'url'    : request.url,
                'payload': request.body,
                'errMsg' : 'Request type not JSON',
                '_id'    :  uuidLib.v1()

            }

            errorLogLib.createErrorLog(errorData);
            /**
             * Request not JSON. Key orientation might be problem in request. Not processing
             * further to prevent loss.
             */
            LOG('jsonPost', {
                error: true,
                message: 'Request type not JSON',
                url: request.url,
                method: request.method
            });
            return next(new errors.BadMethodError('Content-Type should be json'));
        }
        /**
         * Everything is cool, we got json data. Keys can be right so lets process it
         */
        return next();
    };
};
/**
 * @exports jsonPost
 */
module.exports = {
    jsonPost: jsonPost
};
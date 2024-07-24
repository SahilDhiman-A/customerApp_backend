/**
 * @module
 * @desc This module serves as a formatter to the json response sent by the restify
 * @prop {function} application/json - Function that will be called when server sends a json response
 */
 
import LOG from './Log.js'
module.exports = {
    'application/json': function(request, response, body, callback) {
        if (body instanceof Error) {
            console.log(body);
            LOG.LOG('formatJson', {
                error: true,
                message: body.statusCode,
                url: request.url,
                body: body.message
            });
            callback(null, JSON.stringify({
                message: body.message,
                code: body.body ? body.body.code : 'BadRequestError',
                statusCode: body.body ? body.statusCode : 400
            }));
        } else {
            LOG.LOG('formatJson', {
                error: false,
                message: 'Everything OK',
                url: request.url
            });
            callback(null, JSON.stringify({
                data: body,
                message: 'OK',
                statusCode: 200,
                version: request.headers['accept-version']
            }));
        }
    }
};
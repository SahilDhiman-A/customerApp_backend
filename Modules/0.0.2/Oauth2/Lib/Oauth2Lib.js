/**
 * Oauth2-Lib
 * This module is used to provide library functions for Oauth2
 * module: mongoose
 */
 
var mongoose = require('mongoose');
// var jwt = require('jsonwebtoken');
var errors = require('node-restify-errors');
var validator = require('validator');
var _ = require('lodash');
var errorLogLib = require('../../ErrorLog/Lib/ErrorLogLib.js');

var getOauthAccessTokenModel = function() {
    var OAuthAccessTokensSchema = require('../Schema/OAuthAccessTokensSchema.js');
    var model = mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);
    return model;
};


var validateOauthRequest = function() {
    return function(request, response, next) {
        var payload = request.body;
        var oauthPostError = {
            error: false,
            message: ''
        };
        if (_.isNull(payload.Username) || _.isUndefined(payload.Username)) {
            oauthPostError = {
                error: true,
                message: oauthPostError['message'] + ' Username (MISSING): Field is MISSING, '
            }
        }
        if (oauthPostError.error === true) {
            next(new errors.BadRequestError(validator.trim(oauthPostError.message).replace(/  +/g, ' ')));
        } else {
            next();
        }
    }
}


module.exports = {
    getOauthAccessTokenModel: getOauthAccessTokenModel,
    validateOauthRequest: validateOauthRequest
};
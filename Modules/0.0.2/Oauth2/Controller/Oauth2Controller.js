
var router = new(require('restify-router').Router)();
var requestValidatorLib = require('../../RequestValidator/Lib/RequestValidatorLib');
var restifyValidation = require('node-restify-validation');
var oauth2Model = require('../Model/Oauth2Model.js');
var oauth2Lib = require('../Lib/Oauth2Lib.js');
var path = require('path');


router.post({
    url: '/Oauth2/Token',
    validation: {},
    version: [path.basename(path.dirname(path.dirname(__dirname))).toString()]
}, requestValidatorLib.jsonPost(), oauth2Lib.validateOauthRequest(),function(request, response, next) {
    oauth2Model.generateAccessToken(request, response, next);
});

module.exports = router;
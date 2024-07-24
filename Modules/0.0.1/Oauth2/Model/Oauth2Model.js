var oauth2Lib = require('../Lib/Oauth2Lib');
// var dateLib = require('../../Date/Lib/DateLib.js');
var errors = require('node-restify-errors');
var winston = require('winston');
var async = require('async');
var _ = require('lodash');

var generateAccessToken = function(request, response, next) {
    console.log("***function start execution ****");
    var payload = request.body;
    console.log("generateAccessToken", request.body);
};



module.exports = {
    generateAccessToken: generateAccessToken,
};
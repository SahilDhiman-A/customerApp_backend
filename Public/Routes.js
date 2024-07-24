
/**
 * @module
 * @desc
 * All the routes that need to be connected will be found here
 * This returns function which appends routes to the global SERVER
 * variable.
 */
/**
 *@func
 *@param {function} callback - async utility callback function
 */
 
var CONFIG = require('../Config/Config.js');
var _ = require('lodash');

module.exports.initiateRoutes = function(callback) {
	console.log("phase4", CONFIG.apiVersions);
    _.each(CONFIG.apiVersions, function(element, index) {
        var Oauth2 = require('../Modules/' + element + '/Oauth2/Controller/Oauth2Controller.js');
        Oauth2.applyRoutes(SERVER);
    });
    callback();
};

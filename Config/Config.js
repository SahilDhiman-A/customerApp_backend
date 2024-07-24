/** 
 *@desc
 * This module will be used to export the correct env file as per the 
 * env Node is running in
 */
 
console.log(process.env.NODE_ENV + "<----Environment running");
var ENV = require('./Env/' + (process.env.NODE_ENV ? process.env.NODE_ENV : 'development') + '.js');

module.exports = Object.freeze({
    dbconfig: {
        dbConnectionString: ENV.db,
        dbType: 'mongodb',
        replicaSet: ''
    },
  
    test: {
        PORT: ENV.port
    },
    apiVersions: ["0.0.1", "0.0.2"],
    defaultVersion: '0.0.1',
    '0.0.1': {
        oauth2: {
            grantTypes: ['accessToken', 'refreshToken']
        }
       
    },
    '0.0.2': {
        oauth2: {
            grantTypes: ['accessToken', 'refreshToken']
        }
    }
});
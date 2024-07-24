var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
module.exports = new Schema({
    accessToken: {
        token: String,
        expires: Date
    },
    clientId: {
        type: String
    },
    userId: {
        type: String
    },
    selfRequest: {
        type: Boolean
    },
    clientSecret: {
        type: String
    }
});
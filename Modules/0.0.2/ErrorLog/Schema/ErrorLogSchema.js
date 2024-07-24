var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
module.exports = new Schema({
    _id: String,
    addedOn: {
        type: Date,
        default: Date.now
    },
    userId: String,
    method: String,
    url: String,
    errMsg: String,
    payload: Object
}, {
    collection: 'errorLog',
    _v: false
});
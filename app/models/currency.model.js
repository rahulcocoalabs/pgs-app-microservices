const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};


const CurrencySchema = mongoose.Schema({
    name : String,
    code:String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('Currency', CurrencySchema, 'Currencies');
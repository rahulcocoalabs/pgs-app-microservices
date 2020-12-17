const mongoose = require('mongoose');

var options = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;            
        }
    }
}

const EarnCoinSchema = mongoose.Schema({
    title : String,
    youtubeLink : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('EarnCoin', EarnCoinSchema, 'EarnCoins');
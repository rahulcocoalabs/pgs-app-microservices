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
const TheatreSchema = mongoose.Schema({
    name : String,
    description : String,
    city : String,
    province : String,
    stateId : { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
    countryId : { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    lat : String,
    lng : String,
    userIdCreator : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);

module.exports = mongoose.model('Theatre', TheatreSchema, 'Theatres');
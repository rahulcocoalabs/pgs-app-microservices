const mongoose = require('mongoose');
const Theatre = require('./theatre.model.js');

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

const TheatreSeatTypeSchema = mongoose.Schema({
    name : String,
    theatreId: {type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    defaultCost: Number,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}. options);

module.exports = mongoose.model('TheatreSeatType', TheatreSeatTypeSchema, 'TheatreSeatTypes');
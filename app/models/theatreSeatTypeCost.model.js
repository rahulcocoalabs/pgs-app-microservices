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

const TheatreSeatTypeCostSchema = mongoose.Schema({
    theatreSeatTypeId : { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreSeatType' },
    theatreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    cost : Number,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);

//population not required

module.exports = mongoose.model('TheatreSeatTypeCost', TheatreSeatTypeCostSchema, 'TheatreSeatTypeCosts');
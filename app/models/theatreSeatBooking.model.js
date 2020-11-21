const mongoose = require('mongoose');
const Theatre = require('./theatre.model.js');
const TheatreSeat = require('./theatreSeat.model.js');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;

    if (ret.theatreSeat) {
        delete ret.theatreSeatId;
        delete ret.theatreSeat.status;
        delete ret.theatreSeat.tsCreatedAt;
        delete ret.theatreSeat.tsModifiedAt;
    }
    if (ret.theatre) {
        delete ret.theatreId;
        delete ret.theatre.status;
        delete ret.theatre.tsCreatedAt;
        delete ret.theatre.tsModifiedAt;
    }
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

const TheatreSeatBookingSchema = mongoose.Schema({
    theatreSeatId : { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreSeatId' },
    theatreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    isBooked : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}. options);
TheatreSeatBookingSchema.virtual('theatreSeat', {
    ref: 'TheatreSeat',
    localField: 'theatreSeatId',
    foreignField: '_id',
    justOne: true
});
TheatreSeatBookingSchema.virtual('theatre', {
    ref: 'Theatre',
    localField: 'theatreId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('TheatreSeatBooking', TheatreSeatBookingSchema, 'TheatreSeatBookings');
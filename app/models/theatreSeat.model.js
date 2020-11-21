const mongoose = require('mongoose');
const TheatreSeatType = require('./theatreSeatType.model.js');
function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;

    if (ret.theatreSeatType) {
        delete ret.theatreSeatTypeId;
        delete ret.theatreSeatType.status;
        delete ret.theatreSeatType.tsCreatedAt;
        delete ret.theatreSeatType.tsModifiedAt;
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
const TheatreSeatSchema = mongoose.Schema({
    theatreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    theatreSeatTypeId : { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreSeatType' },
    movieBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreMovieBooking'},
    name : String, //example A10
    // col : Number,
    col: Number,
    // row : Number,
    row: String,
    bookingStatus: String,
    statusExpiryTs: Number,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);

//population of theatreId not required 

TheatreSeatSchema.virtual('theatreSeatType', {
    ref: 'TheatreSeatType',
    localField: 'theatreSeatTypeId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('TheatreSeat', TheatreSeatSchema, 'TheatreSeats');
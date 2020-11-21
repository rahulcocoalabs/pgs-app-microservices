const mongoose = require('mongoose');

const TheatreScreenSeatBookingSchema = mongoose.Schema({
    theatreSeatIds : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TheatreScreenSeat',
    }],
    theatreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    screenId : { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreScreen' },
    theatreShowTypeId : { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreShowType' },
    bookedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    showDate: String, 
    isBooked : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number

});
module.exports = mongoose.model('TheatreScreenSeatBooking',  TheatreScreenSeatBookingSchema, 'TheatreScreenSeatBookings');
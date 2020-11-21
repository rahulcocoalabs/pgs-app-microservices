const mongoose = require('mongoose');


const EventBookingSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    name: String,
    email: String,
    phoneNumber: Number,
    participateCount: Number,
    isBooked: Boolean,
    bookedOn: Date,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});

module.exports = mongoose.model('EventBooking', EventBookingSchema, 'EventBookings');
const mongoose = require('mongoose');

const TheatreMovieBookingSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,ref: 'User'},
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, 
    date: String,
    startTimeTs: String,
    endTimeTs: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('TheatreMovieBooking',  TheatreMovieBookingSchema, 'TheatreMovieBooking');
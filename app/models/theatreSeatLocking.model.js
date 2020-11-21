const mongoose = require('mongoose');

const TheatreSeatLockingSchema = mongoose.Schema({
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreScreenSeat' },
    theatreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    screenId : { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreScreens' },
    theatreShowTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreShowType' },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, 
    userIdLockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    showDate: String, 
    status: String, 
    lockedTillTs: Number,
    // status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('TheatreSeatLocking',  TheatreSeatLockingSchema, 'TheatreSeatLocking');
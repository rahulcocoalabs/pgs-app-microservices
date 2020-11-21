const mongoose = require('mongoose');

const TheatreScreenSeatSchema = mongoose.Schema({
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' }, 
    theatreScreenId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreScreen' },
    theatreSeatTypeCostId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheatreSeatTypeCost'},
    rowName: String,
    columnNo: Number,
    userLockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedTillTs:Number, 
    isAvailable: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('TheatreScreenSeat',  TheatreScreenSeatSchema, 'TheatreScreenSeats');
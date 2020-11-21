const mongoose = require('mongoose');

const TheatreShowTypeSchema = mongoose.Schema({
    showTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShowType' }, 
    startTime: String,
    endTime: String,
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('TheatreShowType',  TheatreShowTypeSchema, 'TheatreShowType');
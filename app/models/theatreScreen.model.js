const mongoose = require('mongoose');

const TheatreScreenSchema = mongoose.Schema({
    name:String,
    rowCount: String,
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' }, 
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('TheatreScreen',  TheatreScreenSchema, 'TheatreScreens');
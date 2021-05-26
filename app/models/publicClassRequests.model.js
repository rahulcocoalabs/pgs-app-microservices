const mongoose = require('mongoose');
var moment = require('moment');


var PublicClassRquestSchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass' },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    isPaid:{ type: Boolean, default: false},
    status: Number,
    created:String,
    comments:String,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('PublicClassRquest', PublicClassRquestSchema, 'PublicClassRquests');
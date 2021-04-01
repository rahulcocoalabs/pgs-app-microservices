const mongoose = require('mongoose');
var moment = require('moment');


var OnlineClassRquestSchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass' },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isApproved:Boolean,
    isRejected:Boolean,
    status: Number,
   
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('OnlineClassRquest', OnlineClassRquestSchema, 'OnlineClassRquests');
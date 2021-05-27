const mongoose = require('mongoose');
var moment = require('moment');


var OnlineClassRquestSchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass' },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic:{
        type:Boolean,
        default:false
    },
    isApproved:Boolean,
    isRejected:Boolean,
    isPaid:{ type: Boolean, default: false},
    status: Number,
    created:String,
    comments:String,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('OnlineClassRquest', OnlineClassRquestSchema, 'OnlineClassRquests');
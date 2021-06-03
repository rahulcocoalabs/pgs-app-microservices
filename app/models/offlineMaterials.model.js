const mongoose = require('mongoose');
var moment = require('moment');


var OfflineMaterialSchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass' },
    link:String,
    title:String,
    description:String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('OfflineMaterial', OfflineMaterialSchema, 'OfflineMaterials');
const mongoose = require('mongoose');



const AlumniEventsSchema = mongoose.Schema({
    title: String,
    description: String,
    venue : String,
    date: String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    image:String,
    status:Number,
    
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniEvent', AlumniEventsSchema, 'AlumniEvents');
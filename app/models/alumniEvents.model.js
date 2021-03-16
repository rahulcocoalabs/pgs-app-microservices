const mongoose = require('mongoose');



const AlumniEventsSchema = mongoose.Schema({
    title: String,
    description: String,
    venue : String,
    date: String,
    availableFromTime:String,
    availableToTime:String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    image:String,
    liveLink:String,
    status:Number,
    
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniEvent', AlumniEventsSchema, 'AlumniEvents');
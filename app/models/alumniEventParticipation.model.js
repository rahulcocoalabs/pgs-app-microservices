const mongoose = require('mongoose');



const AlumniEventParticipationSchema = mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlumniEvent' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    name:String,
    email:String,
    attendeeCount:Number,
    status:Number,
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniEventParticipation', AlumniEventParticipationSchema, 'AlumniEventParticipations');
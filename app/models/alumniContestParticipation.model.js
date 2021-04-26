const mongoose = require('mongoose');



const AlumniContestParticipationSchema = mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlumniContestRef' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    name:String,
    rank:Number,
    email:String,
    
    status:Number,
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniContestParticipation', AlumniContestParticipationSchema, 'AlumniContestParticipations');
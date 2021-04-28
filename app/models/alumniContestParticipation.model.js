const mongoose = require('mongoose');



const AlumniContestParticipationSchema = mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlumniContestRef' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    title:String,
    rank:Number,
    type:String,
    
    status:Number,
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniContestParticipation', AlumniContestParticipationSchema, 'AlumniContestParticipations');
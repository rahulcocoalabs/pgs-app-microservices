const mongoose = require('mongoose');



const AlumniJobApplicationsSchema = mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlumniJob' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    
    
    status:Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniJobApplication', AlumniJobApplicationsSchema, 'AlumniJobApplications');
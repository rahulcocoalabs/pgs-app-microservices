const mongoose = require('mongoose');



const AlumniJobsSchema = mongoose.Schema({
    position: String,
    company: String,
    description : String,
    location: String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    image:String,
    status:Number,
    
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniJob', AlumniJobsSchema, 'AlumniJobs');
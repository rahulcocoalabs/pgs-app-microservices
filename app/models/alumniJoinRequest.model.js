const mongoose = require('mongoose');



const AlumniJoinRequestSchema = mongoose.Schema({

    name:String,
    address:String,
    companyName:String,
    designation:String,
    college:String,
    batch:String,
    passingYear:String,
    contact:String,
    fbLink:String,
    linkedLink:String,
    email:String,
    isApproved:String,
    status : Number,
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    group:{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniJoinRequest', AlumniJoinRequestSchema, 'AlumniJoinRequests');
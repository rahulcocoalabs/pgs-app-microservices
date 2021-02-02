const mongoose = require('mongoose');



const AlumniJoinRequestSchema = mongoose.Schema({
   
    status : Number,
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    group:{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('AlumniJoinRequest', AlumniJoinRequestSchema, 'AlumniJoinRequests');
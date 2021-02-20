const mongoose = require('mongoose');



const ContestInnovationSchema = mongoose.Schema({
    title: String,
    estimate: String,
    projectBrief:String,
    
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('ContestInnovation', ContestInnovationSchema, 'ContestInnovations');
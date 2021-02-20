const mongoose = require('mongoose');



const ContestInnovationSchema = mongoose.Schema({
    title: String,
    description: String,
    file:String,
    video:String,
    file:String,
    uploadFileType:String,
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('ContestInnovation', ContestInnovationSchema, 'ContestInnovations');
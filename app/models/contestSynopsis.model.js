const mongoose = require('mongoose');

const ContestSynopsisSchema = mongoose.Schema({
    title: String,
    synopsis: String,
   
    type:String,
    uploadFileType:String,
    images: [String],
    fromDate: Number,
    toDate: Number,
    isResultAnnounced : Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
});
module.exports = mongoose.model('ContestSynopsis', ContestSynopsisSchema, 'ContestSynopsises');
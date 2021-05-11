const mongoose = require('mongoose');

const ContestSynopsisSchema = mongoose.Schema({
    title: String,
    synopsis: String,
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contestId : { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
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
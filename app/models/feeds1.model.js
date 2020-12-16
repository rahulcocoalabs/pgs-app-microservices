const mongoose = require('mongoose');
const FeedsSchema1 = mongoose.Schema({
    title: String,
    description: String,
    images: [String],
    video: String,
    documents: [String],
    authorUserId:{ type: mongoose.Schema.Types.ObjectId, ref: 'authorUser' },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    creatorDob: Number,
    creatorLanguage: String,
    startAge: Number,
    endAge: Number,
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language'},
    emotions: [{
        emotion: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    youTubeLink: String,
    feedType: String,
    type: String,
    sharingUrl: String,
    isFav: Boolean,
    rank : Number,
    isApproved: Number,
    isRejected: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})


module.exports = mongoose.model('Feed', FeedsSchema1, 'Feeds');
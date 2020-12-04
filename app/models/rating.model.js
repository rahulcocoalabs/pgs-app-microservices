const mongoose = require('mongoose');


const RatingSchema = mongoose.Schema({
    rating: Number,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type:String,
    classId:{type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass'},
    tutorId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('Rating', RatingSchema, 'Ratings');
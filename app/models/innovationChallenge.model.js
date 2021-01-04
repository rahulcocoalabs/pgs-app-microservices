const mongoose = require('mongoose');




const InnovationSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contestId : { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    title : String,
    description : String,
    price:String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('InnovationChallenge', InnovationSchema, 'InnovationChallenges');
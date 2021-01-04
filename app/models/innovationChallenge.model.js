const mongoose = require('mongoose');




const InnovationSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title : String,
    description : String,
    price:String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('InnovationChallenge', InnovationSchema, 'InnovationChallenges');
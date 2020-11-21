const mongoose = require('mongoose');


const VideoCategorySchema = mongoose.Schema({
    name : String, 
    image : String, 
    gradientStartColorHex : String,
    gradientEndColorHex : String,
    gradientAngleDegrees : String,
    userIdCreator : mongoose.Schema.Types.ObjectId,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('VideoCategory', VideoCategorySchema, 'VideoCategories');
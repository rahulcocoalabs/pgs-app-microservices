const mongoose = require('mongoose');




const InstituteClassSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image:String,
    name:String,
    isPopular:Boolean,
    location:String,
    phone:String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('InstituteClass', InstituteClassSchema, 'InstituteClasses');
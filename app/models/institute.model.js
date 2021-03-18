const mongoose = require('mongoose');




const InstituteSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image:String,
    name:String,
    isPopular:Boolean,
    location:String,
    phone:String,
    email:String,
    description:String,
    isApproved:Boolean,
    isRejected:Boolean,
    instituteCourse : [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstitutionCourse' }],
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Institute', InstituteSchema, 'Institutes');
const mongoose = require('mongoose');




const InstituteUpdateRequestSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    institution:{ type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
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

module.exports = mongoose.model('InstituteUpdateRequest', InstituteUpdateRequestSchema, 'InstituteUpdateRequests');
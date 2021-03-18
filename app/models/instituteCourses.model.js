const mongoose = require('mongoose');


const InstituteCourseSchema = mongoose.Schema({
    name : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('InstituteCourse', InstituteCourseSchema, 'InstituteCourses');
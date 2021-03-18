const mongoose = require('mongoose');


const InstituteCourseSchema = mongoose.Schema({
    name : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('InstitutionCourse', InstituteCourseSchema, 'InstitutionCourses');
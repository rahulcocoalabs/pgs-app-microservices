const mongoose = require('mongoose');




const InstituteClassSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rateduser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorSubjectId : { type: mongoose.Schema.Types.ObjectId, ref: 'TutorSubject' },
    tutorClassId : { type: mongoose.Schema.Types.ObjectId, ref: 'TutorClass' },
    currencyId : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
    tutorSyllabusId : { type: mongoose.Schema.Types.ObjectId, ref: 'TutorSyllabus' },
    institution:{ type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    tutorSubject:String,
    tutorClass:String,
    tutorSyllabus:String,
    qualification:String,
    availableFromTime:String,
    availableToTime:String,
    category : String,
    image : String,
    tutorName:String,
    video:String,
    title : String,
    avaregeRating:Number,
    classDescription : String,
    isPaid: Boolean,
    isPopular: Boolean,
    classTimeCategory: String,
    fee: Number,
    availableDays : [String],
    availableTime : String,
    zoomLink : String,
    startUrl : String,
    isPublic : Boolean,
    isApproved : Boolean,
    isRejected : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('InstituteClass', InstituteClassSchema, 'InstituteClasses');
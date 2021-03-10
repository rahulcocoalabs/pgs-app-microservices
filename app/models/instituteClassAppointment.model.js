const mongoose = require('mongoose');
var moment = require('moment');


var ClassAppointmentSchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    instituteClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstituteClass' },
    tutorSubjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'tutorSubject' },
    tutorClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'tutorClass' },
    status: Number,
    isApproved:Boolean,
    isRejected:Boolean,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('InstitutesClassAppointment', ClassAppointmentSchema, 'InstitutesClassAppointments');
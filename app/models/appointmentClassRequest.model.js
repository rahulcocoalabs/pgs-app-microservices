const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};


const AppointmentClassRequestSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tutorId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tutorSubjectId : { type: mongoose.Schema.Types.ObjectId, ref: 'TutorSubject' },
    tutorClassId : { type: mongoose.Schema.Types.ObjectId, ref: 'TutorClass' },
    isApproved : Boolean,
    isRejected : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('AppointmentClassRequest', AppointmentClassRequestSchema, 'AppointmentClassRequests');
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


const TutorRequestSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tutorCourseIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorCourse' }],
    tutorSubjectIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorSubject' }],
    tutorClassIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorClass' }],
    tutorCategoryIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorCategory' }],
    courceDescription : String,
    isPaid: Boolean,
    fee: Number,
    sampleVideo : String,
    location : String,
    lat : Number,
    lng : Number,
    isApproved : Boolean,
    isRejected : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('TutorRequest', TutorRequestSchema, 'TutorRequests');
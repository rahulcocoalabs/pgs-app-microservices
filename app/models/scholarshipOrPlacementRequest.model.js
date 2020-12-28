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


const ScholarshipOrPlacementRequestSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scholarshipOrPlacementId : { type: mongoose.Schema.Types.ObjectId, ref: 'ShopProductRequest' },
    isStudent : Boolean,
    courceDoing : String,
    previousClassDetails : String,
    subjectWithGrades : String,
    higherEducation : String,
    projectBrief : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('ScholarshipOrPlacementRequest', ScholarshipOrPlacementRequestSchema, 'ScholarshipOrPlacementRequests');
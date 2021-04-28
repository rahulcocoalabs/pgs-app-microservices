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
const alumniContestSchema = mongoose.Schema(
    {
        "title": String,
        "aboutContest": String,
        "place": String,
        "description":String,
        "status": Number,
        "fromDate": Number,
        "toDate": Number,
        "image":String,
        "isResultAnnounced": Boolean,
        "tsCreatedAt": Number,
        "tsModifiedAt": Number
    },options
)
// database collection have name AlumniContest so reference variable given name AlumniContestRef
module.exports = mongoose.model('AlumniContestRef', alumniContestSchema, 'AlumniContest');
const mongoose = require('mongoose');

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
    }
)
// database collection have name AlumniContest so reference variable given name AlumniContestRef
module.exports = mongoose.model('AlumniContestRef', alumniContestSchema, 'AlumniContest');
const mongoose = require('mongoose');


const StudentTutorRequestsSchema = mongoose.Schema({
  
    description : String,
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject : { type: mongoose.Schema.Types.ObjectId, ref: 'TutorSubject' },
    class : { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass' },
   
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number });

module.exports = mongoose.model('StudentTutorRequest', StudentTutorRequestsSchema, 'StudentTutorRequests');
const mongoose = require('mongoose');


const TestResultSchema = mongoose.Schema({
    userId :  {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    testId :  { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    testQuestionId : { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestion' },
    testQuestionOptionId : { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestionOption' },
    points : Number, 
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('TestResult', TestResultSchema, 'TestResults');
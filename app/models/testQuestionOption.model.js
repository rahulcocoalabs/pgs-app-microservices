const mongoose = require('mongoose');

var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.questionId;
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.questionId;
        }
    }
};

const TestQuestionOptionSchema = mongoose.Schema({
    title: String,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestion' },
    sortOrder: Number,
    isCorrect: Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options)

module.exports = mongoose.model('TestQuestionOption', TestQuestionOptionSchema, 'TestQuestionOptions');
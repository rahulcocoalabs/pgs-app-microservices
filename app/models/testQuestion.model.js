const mongoose = require('mongoose');
const testQuestionOption = require('./testQuestionOption.model.js');

var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            if (ret.options) {
                delete ret.optionIds;
                var i = 0;
                var ln = ret.options.length;
                while (i < ln) {
                    delete ret.options[i].status;
                    delete ret.options[i].tsCreatedAt;
                    delete ret.options[i].tsModifiedAt;
                    i++;
                }
            }
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            if (ret.options) {
                delete ret.optionIds;
                var i = 0;
                var ln = ret.options.length;
                while (i < ln) {
                    delete ret.options[i].status;
                    delete ret.options[i].tsCreatedAt;
                    delete ret.options[i].tsModifiedAt;
                    i++;
                }
            }
        }
    }
};

const TestQuestionSchema = mongoose.Schema({
    title: String,
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    optionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestionOption' }],
    points: Number,
    isIncludedInTrial: Boolean,
    sortOrder: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options);

TestQuestionSchema.virtual('options', {
    ref: 'TestQuestionOption',
    localField: 'optionIds',
    foreignField: '_id',
    justOne: false
});

module.exports = mongoose.model('TestQuestion', TestQuestionSchema, 'TestQuestions');
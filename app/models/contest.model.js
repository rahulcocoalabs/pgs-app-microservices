const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
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

const ContestSchema = mongoose.Schema({
    title: String,
    description: String,
    place: String,
    image: String,
    fromDate: Number,
    toDate: Number,
    isResultAnnounced : Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
    
}, options);
module.exports = mongoose.model('Contest', ContestSchema, 'Contests');
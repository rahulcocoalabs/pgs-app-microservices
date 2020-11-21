const mongoose = require('mongoose');

var options = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
};
const BookPublisherSchema = mongoose.Schema({
    name: String,
    image: String,
    description: String,
    userIdCreator: mongoose.Schema.Types.ObjectId,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);

module.exports = mongoose.model('BookPublisher', BookPublisherSchema, 'BookPublishers');

BookPublisherSchema.virtual('id').get(function () {
    var id = this._id;
    return id;
});
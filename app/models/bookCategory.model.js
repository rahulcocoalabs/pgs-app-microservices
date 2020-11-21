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

const BookCategorySchema = mongoose.Schema({
    name : String,
    description : String,
    image : String,
    gradientStartColorHex : String,
    gradientEndColorHex : String,
    gradientAngleDegrees : Number,
    userIdCreator: mongoose.Schema.Types.ObjectId,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('BookCategory', BookCategorySchema, 'BookCategories');
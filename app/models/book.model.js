const mongoose = require('mongoose');
var moment = require('moment');
var utilities = require("../components/utilities.component.js");
var Favourite = require('./favourite.model.js');
var Language = require('./language.model.js');
function transform(item) {
    var ret = item;
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
    if (ret.publisher) {
        delete ret.publisherId;
        delete ret.publisher.status;
        delete ret.publisher.tsCreatedAt;
        delete ret.publisher.tsModifiedAt;
        delete ret.publisher.userIdCreator;
    }
    if (ret.authors) {
        delete ret.bookAuthorIds;
        var i = 0;
        var ln = ret.authors.length;
        while (i < ln) {
            delete ret.authors[i].userIdCreator;
            delete ret.authors[i].status;
            delete ret.authors[i].tsCreatedAt;
            delete ret.authors[i].tsModifiedAt;
            i++;
        }
    }
    if (ret.categories) {
        delete ret.bookCategoryIds;
        var i = 0;
        var ln = ret.categories.length;
        while (i < ln) {
            delete ret.categories[i].gradientStartColorHex;
            delete ret.categories[i].gradientEndColorHex;
            delete ret.categories[i].gradientAngleDegrees;
            delete ret.categories[i].status;
            delete ret.categories[i].tsCreatedAt;
            delete ret.categories[i].tsModifiedAt;
            i++;
        }
    }
    if (ret.datePublished) {
        ret.datePublished = moment(ret.datePublished).format("YYYY");
    }
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
const BookSchema = mongoose.Schema({
    name: String,
    description: String,
    file: String,
    bookAuthorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BookAuthor' }],
    bookPublisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookPublisher' },
    bookCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BookCategory' }],
    pageCount: Number,
    viewCount: Number,
    averageRating: Number,
    reviewCount: Number,
    datePublished: Date,
    image: String,
    minUserAge: Number,
    maxUserAge: Number,
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
    sharingUrl: String,
    userIdCreator: String,
    tags: [String],
    isTrending: Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);

/*BookSchema.virtual('id').get(function () {
    return this._id;
});*/
BookSchema.virtual('publisher', {
    ref: 'BookPublisher',
    localField: 'bookPublisherId',
    foreignField: '_id',
    justOne: true
});

BookSchema.virtual('language', {
    ref: 'Language',
    localField: 'languageId',
    foreignField: '_id',
    justOne: true
}); 

BookSchema.virtual('authors', {
    ref: 'BookAuthor',
    localField: 'bookAuthorIds',
    foreignField: '_id',
    justOne: false
});

BookSchema.virtual('categories', {
    ref: 'BookCategory',
    localField: 'bookCategoryIds',
    foreignField: '_id',
    justOne: false
});


//BookSchema.virtuals = true;

module.exports = mongoose.model('Book', BookSchema, 'Books');
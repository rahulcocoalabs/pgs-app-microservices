const mongoose = require('mongoose');
var moment = require('moment');
var Book = require('./book.model.js');
function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    ret.time = moment(ret.tsCreatedAt).format("HH:MM:SS A, DD MMMM YYYY");
    delete ret.tsCreatedAt;
    /*ret.getBook(function (book) {
        console.log(book);
    });
    console.log(this.item); */
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
}
var FavouritesSchema = mongoose.Schema({
    itemId: String,
    itemType: String,
    userId: mongoose.Schema.Types.ObjectId,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options)



/*FavouritesSchema.item(function( data) {
    console.log(data);
});
FavouritesSchema.getBook = function(cb) {
    console.log("getBook function is called");
    return Book.findOne({ _id: this.itemId });
} */


module.exports = mongoose.model('Favourites', FavouritesSchema, 'Favourites');
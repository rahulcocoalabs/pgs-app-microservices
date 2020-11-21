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

const BookAuthorSchema = mongoose.Schema({
    name : String, 
    image : String,
    biography : String,
    activeFromYear : Number,
    activeToYear : Number,
    userCreatorId : mongoose.Schema.Types.ObjectId,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
},options)

module.exports = mongoose.model('BookAuthor', BookAuthorSchema, 'BookAuthors');
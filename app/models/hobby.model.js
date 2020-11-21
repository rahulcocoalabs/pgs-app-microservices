const mongoose = require('mongoose');

var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;            
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;            
        }
    }
}


const HobbySchema = mongoose.Schema({
    name : String,
    userIdCreator : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('Hobby', HobbySchema, 'Hobbies');
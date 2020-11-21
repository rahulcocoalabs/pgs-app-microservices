const mongoose = require('mongoose');

const TagSchema = mongoose.Schema({
    title : String,
    itemId : mongoose.Schema.Types.ObjectId,
    itemType : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Tag', TagSchema, 'Tags');
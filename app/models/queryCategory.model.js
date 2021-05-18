const mongoose = require('mongoose');

const QuerySchema = mongoose.Schema({
    name:String,
    description:String,
    image:String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('QueryCategory', QuerySchema, 'Categories');
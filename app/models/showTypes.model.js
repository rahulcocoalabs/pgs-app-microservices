const mongoose = require('mongoose');

const ShowTypeSchema = mongoose.Schema({
    name: String, 
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('ShowType', ShowTypeSchema, 'ShowTypes');
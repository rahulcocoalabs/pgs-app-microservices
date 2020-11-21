const mongoose = require('mongoose');

const FiltersSchema = mongoose.Schema({
    entity: String, //which page filter is applied ? example book, video, game, 
    title: String,
    fieldName: String, // use this for giving filter while querying
    filterType: String, //options, radio, range, text
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Filter', FiltersSchema, 'Filters');
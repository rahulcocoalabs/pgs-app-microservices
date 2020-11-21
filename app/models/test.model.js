const mongoose = require('mongoose');


const TestSchema = mongoose.Schema({
    testType : String,
    title : String, 
    image : String,
    images : [String],
    description : String, 
    amount : Number,
    testCategoryIds : { type: mongoose.Schema.Types.ObjectId, ref: 'TestCategory' },
    isFav: Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Test', TestSchema, 'Tests');
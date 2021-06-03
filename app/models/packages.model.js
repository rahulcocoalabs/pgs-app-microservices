const mongoose = require('mongoose');


const PackagsSchema = mongoose.Schema({
    status : Number,
    noOfDays:Number,
    name:String,
    amount:String,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Package', PackagsSchema, 'OfflinePackages');
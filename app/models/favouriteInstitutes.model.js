const mongoose = require('mongoose');
var moment = require('moment');


var FavouriteInstituteSchema = mongoose.Schema({
    
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('FavouriteInstitute', FavouriteInstituteSchema, 'FavouriteInstitutes');
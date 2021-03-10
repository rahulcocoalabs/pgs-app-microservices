const mongoose = require('mongoose');

require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;


const InstituteClassFavouriteSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    institutionClass: { type: mongoose.Schema.Types.ObjectId, ref: 'InstituteClass' },
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('InstituteClassFavourite', InstituteClassFavouriteSchema, 'InstituteClassFavourites');
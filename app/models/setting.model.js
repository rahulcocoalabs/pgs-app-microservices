const mongoose = require('mongoose');

const SettingsSchema = mongoose.Schema({
    key : String,
    value : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Setting', SettingsSchema, 'Settings');
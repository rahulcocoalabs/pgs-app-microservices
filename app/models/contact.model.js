const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
    message: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Contact', ContactSchema, 'Contacts');
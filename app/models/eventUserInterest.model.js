const mongoose = require('mongoose');


const EventInterestSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});

module.exports = mongoose.model('EventUserInterest', EventInterestSchema, 'EventUserInterests');
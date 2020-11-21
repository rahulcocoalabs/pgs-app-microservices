const mongoose = require('mongoose');
var options = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.status,
            delete ret.tsCreatedAt,
            delete ret.tsModifiedAt
        }
    }
};
const EventOrganizerSchema = mongoose.Schema({
    name: String,
    description: String,
    image: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options);


module.exports = mongoose.model('EventOrganizer', EventOrganizerSchema, 'EventOrganizers');
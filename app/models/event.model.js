const mongoose = require('mongoose');
var utilities = require('../components/utilities.component.js');
var moment = require('moment');
var EventCategory = require('./eventCategory.model.js');
var EventOrganizer = require('./eventOrganizer.model.js');
var options = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            ret.eventDate = moment(ret.eventDate).format("DD MMMM YYYY");
            delete ret._id;
            if(ret.organizer) {
                delete ret.eventOrganizerId,
                delete ret.organizer.status,
                delete ret.organizer.tsCreatedAt,
                delete ret.organizer.tsModifiedAt
            }
            if(ret.category) {
                delete ret.eventCategoryId,
                delete ret.category.description,
                delete ret.category.userIdCreator,
                delete ret.category.image,
                delete ret.category.status,
                delete ret.category.tsCreatedAt,
                delete ret.category.tsModifiedAt
            }
            
        }
    }
}

const EventsSchema = mongoose.Schema({
    title : String,
    description : String,  
    amount : Number, 
    image : String, 
    lat : Number, 
    lng : Number, 
    venue : String, 
    eventDate : Date, 
    tsFrom : Number, 
    tsTo : Number,
    eventCategoryId : { type: mongoose.Schema.Types.ObjectId, ref: 'EventCategory' },
    eventOrganizerId : { type: mongoose.Schema.Types.ObjectId, ref: 'EventOrganizer' },
    isFav : Boolean,
    userIdCreator : mongoose.Schema.Types.ObjectId,
    speakerName : String,
    speakerTypeId : { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakerType' },
    speakerTitle  :String,
    speakerOrganisation  :String,
    speakerDescription : String,
    speakerImage : String,
    speakerVideoLinks : [String],
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

EventsSchema.virtual('organizer', {
    ref: 'EventOrganizer',
    localField: 'eventOrganizerId',
    foreignField: '_id',
    justOne: true
});
EventsSchema.virtual('category', {
    ref: 'EventCategory',
    localField: 'eventCategoryId',
    foreignField: '_id',
    justOne: true
});

EventsSchema.virtual('sharingUrl').get(function () {
    return utilities.getSharingUrl("events", this._id);
});


module.exports = mongoose.model('Event', EventsSchema, 'Events');
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
        }
    }
};

const AdvertisementProviderSchema = mongoose.Schema({
    name : String,
    logo : String,
    image : String,
    link : String, 
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);



module.exports = mongoose.model('AdvertisementProvider', AdvertisementProviderSchema, 'AdvertisementProviders');
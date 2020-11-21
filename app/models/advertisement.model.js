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
            if (ret.nationalities) {
                delete ret.nationalityIds;
                var i = 0;
                var ln = ret.nationalities.length;
                while(i<n) {
                    delete ret.nationalities[i]._id;
                    delete ret.nationalities[i].status;
                    delete ret.nationalities[i].tsCreatedAt;
                    delete ret.nationalities[i].tsModifiedAt;
                    delete ret.nationalities[i].userIdCreator;
                    i++;
                }
            }
            if (ret.genders) {
                delete ret.genderIds;
                var i = 0;
                var ln = ret.genders.length;
                while (i < ln) {
                    delete ret.genders[i]._id;
                    delete ret.genders[i].status;
                    delete ret.genders[i].tsCreatedAt;
                    delete ret.genders[i].tsModifiedAt;
                    delete ret.genders[i].userIdCreator;
                    i++;
                }
            }
            if(ret.provider) {
                delete ret.providerId;
                delete ret.provider.status;
                delete ret.provider.tsCreatedAt;
                delete ret.provider.tsModifiedAt;
            }
        }
    }
};

const AdvertisementSchema = mongoose.Schema({
    title : String,
    description : String,
    image : String,
    providerId : { type: mongoose.Schema.Types.ObjectId, ref: 'AdvertisementProvider' },
    thumbnail: String,
    area: String,
    tsExpiresAt : Number, 
    minUserAge : Number,
    maxUserAge : Number,
    nationalityIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nationality' }],
    genderIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gender' }],
    userIdCreator : mongoose.Schema.Types.ObjectId,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);

AdvertisementSchema.virtual('nationalities', {
    ref: 'Nationality',
    localField: 'nationalityIds',
    foreignField: '_id',
    justOne: false
});

AdvertisementSchema.virtual('genders', {
    ref: 'Gender',
    localField: 'genderIds',
    foreignField: '_id',
    justOne: false
});


AdvertisementSchema.virtual('provider', {
    ref: 'AdvertisementProvider',
    localField: 'providerId',
    foreignField: '_id',
    justOne: true
});


module.exports = mongoose.model('Advertisement', AdvertisementSchema, 'Advertisements');
const mongoose = require('mongoose');
const Country = require('./country.model.js');
function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;

    if (ret.country) {
        delete ret.countryId;
        delete ret.country.status;
        delete ret.country.tsCreatedAt;
        delete ret.country.tsModifiedAt;
    }
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};


const StateSchema = mongoose.Schema({
    name: String,
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    userIdCreator: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options);

StateSchema.virtual('country', {
    ref: 'Country',
    localField: 'countryId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('State', StateSchema, 'States');
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
           if (ret.bankAccount) {
                delete ret.bankAccountId;
                delete ret.bankAccount.status;
                delete ret.bankAccount.tsCreatedAt;
                delete ret.bankAccount.tsModifiedAt;
                //delete ret.bankAccount.userIdCreator;
            }
           
        }
    }
};

const CharitySchema = mongoose.Schema({
    title : String,
    description : String, 
    amountNeeded : Number,
    amountCollected : Number,
    isOpen : Boolean,
    image : String,
    bankAccountId : { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
    banners : [{
        title : String,
        image : String
        }],
    attributesList : [{key: String, value: String}],
    sharingUrl : String,
    isFav : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

CharitySchema.virtual('bankAccount', {
    ref: 'BankAccount',
    localField: 'bankAccountId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Charity', CharitySchema, 'Charities');
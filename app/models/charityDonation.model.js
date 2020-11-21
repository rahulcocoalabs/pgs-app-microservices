const mongoose = require('mongoose');


const charityDonationSchema = mongoose.Schema({
    userId :  {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    charityId :  { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
    amount: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
})

module.exports = mongoose.model('CharityDonation',charityDonationSchema, 'CharityDonations');
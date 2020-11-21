const mongoose = require('mongoose');


const OtpSchema = mongoose.Schema({
    countryCode : String,
    phone : String, 
    email: String,
    isUsed : Boolean,
    userToken : String,
    apiToken : String,
    smsResponse : String,
    trials: Number,
    expiry : String,
    tsCreatedAt : Number,
    tsModifiedAt : Number
})

module.exports = mongoose.model('Otp', OtpSchema, 'Otps');
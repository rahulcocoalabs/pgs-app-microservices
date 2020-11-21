const mongoose = require('mongoose');

const CoinSchema = mongoose.Schema({
    photo: String,
    video: String,
    doc: String,
    youtube: String, 
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Coin', CoinSchema, 'Coins');
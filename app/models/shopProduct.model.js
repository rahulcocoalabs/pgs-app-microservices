const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
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


const ShopProductSchema = mongoose.Schema({
    shopId : { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    mainImage : String,
    name : String,
    description : String,
    price: Number,
    point: Number,
    quantity : Number,
    isActive : Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('ShopProduct', ShopProductSchema, 'ShopProducts');
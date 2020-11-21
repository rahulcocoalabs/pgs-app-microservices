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


const ShopProductRequestSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shopProductId : { type: mongoose.Schema.Types.ObjectId, ref: 'ShopProduct' },
    shopId : { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    quantity : Number,
    point : Number,
    price: Number,
    requestStatus : String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options)

module.exports = mongoose.model('ShopProductRequest', ShopProductRequestSchema, 'ShopProductRequests');
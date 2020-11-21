const mongoose = require('mongoose');
const moment = require('moment');
function transform(record) {
    record.id = record.mysqlProductId;
    record.originalId = record._id.toString();
    delete record._id;
    delete record.mysqlProductId;
    if (record.categories) {
        delete record.categoryIds;
        var i = 0;
        var len = record.categories.length;
        while (i < len) {
            delete record.categories[i].mysqlParentCategoryId,
                delete record.categories[i].mongoParentCategoryId,
                delete record.categories[i].mysqlCategoryId,
                delete record.categories[i].sortOrder,
                delete record.categories[i].status,
                delete record.categories[i].tsCreatedAt,
                delete record.categories[i].tsModifiedAt,

                i++;
        }
    }
    if (record.discounts) {
        var j = 0;
        var len = record.discounts.length;
        date = new Date();
        currentTs = date.getTime();
        while (j < len) {
            tsStart = moment(record.discounts[j].dateStart).format("DD MM YYYY");
            tsEnd = moment(record.discounts[j].dateEnd).format("DD MM YYYY");
            if (tsStart < currentTs && tsEnd > currentTs) {
                record.finalPrice = record.discounts[j].price;
                break;
            }
                j++;
        }
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
const StoreProductSchema = mongoose.Schema({
    name: String,
    mysqlProductId: Number,
    shortDescription: String,
    description: String,
    originalPrice: Number,
    averageRating: Number,
    maxRating: Number,
    discounts: [{
        quantity: Number,
        priority: Number,
        price: Number,
        date_start: Date,
        date_end: Date
    }],
    image: String,
    subImages: [{
        name: String,
        sortOrder: String
    }],
    attributes: [{
        key: String,
        value: Number
    }],
    stockStatus: String,
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreCategory' }],
    specifications: {
        requiresShipping: Number,
        length: Number,
        weight: Number,
        width: Number,
        height: Number,
        lengthClass: String, //centimeters
        weightClass: String //kilograms
    },
    isFav: Boolean,
    sharingUrl: String,
    sortOrder: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options)


StoreProductSchema.virtual('categories', {
    ref: 'StoreCategory',
    localField: 'categoryIds',
    foreignField: '_id',
    justOne: false
});

StoreProductSchema.virtual('finalPrice').get(function () {
    return this.originalPrice;
});

module.exports = mongoose.model('StoreProduct', StoreProductSchema, 'StoreProducts');
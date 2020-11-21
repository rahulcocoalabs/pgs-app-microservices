const mongoose = require('mongoose');
function transform(record) { 
    record.id = record._id; 
    delete record._id;  
    /*if(record.category) {
        delete record.categoryId;
    }
    if(record.product) {
        delete record.productId;
    } */
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
const StoreBannerSchema = mongoose.Schema({
    title : String,
    sortOrder : String,
    status : Number,
    mySqlBannerId : Number,
    productId : Number,
    categoryId : Number,
    sortOrder:Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number,
},options);

/*StoreBannerSchema.virtual('category', {
    ref: 'StoreCategory',
    localField : 'categoryId',
    foreignField : '_id', 
    justOne : true
});
StoreBannerSchema.virtual('product', {
    ref: 'StoreProduct',
    localField : 'productId',
    foreignField : '_id', 
    justOne : true
}); */

module.exports = mongoose.model('StoreBanner', StoreBannerSchema, 'StoreBanners');
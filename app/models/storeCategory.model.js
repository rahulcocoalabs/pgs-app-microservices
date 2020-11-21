const mongoose = require('mongoose');
function transform(record) {
    record.id = record._id;
    delete record._id;
    console.log("Transform this....");
    //ret.dateOfRelease = moment(ret.dateOfRelease,'YYYY-mm-dd') 
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
const StoreCategorySchema = mongoose.Schema({
    name: String,
    description: String,
    image: String,
    gradientStartColorHex: String,
    gradientEndColorHex: String,
    image: String,
    sortOrder: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
},options)

module.exports = mongoose.model('StoreCategory', StoreCategorySchema, 'StoreCategories');
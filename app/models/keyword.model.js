const mongoose = require('mongoose');
function transform(record) { 
    var ret = record;
    ret.id = ret._id; 
    delete ret._id;
    
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

const KeywordSchema = mongoose.Schema({
    value: String,
    itemId: String,
    itemType: String,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number

}, options)
,
module.exports = mongoose.model('Keyword', KeywordSchema, 'Keywords');
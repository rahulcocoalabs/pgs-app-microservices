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
            if(ret.categories) {
                delete ret.gameCategoryIds;
                var i = 0;
                var ln = ret.categories.length;
                while(i<ln) {
                    delete ret.categories[i].gradientStartColorHex;
                    delete ret.categories[i].gradientEndColorHex;
                    delete ret.categories[i].gradientAngleDegrees;
                    delete ret.categories[i].status;
                    delete ret.categories[i].tsCreatedAt;
                    delete ret.categories[i].tsModifiedAt;
                    i++;
                }
            }
        }
    }
};

const GameSchema = mongoose.Schema({
    title : String,
    gameCategoryIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'GameCategory' }],
    image : String, 
    banners : [String],
    playstroreUrl : String,
    videoYoutubeId : String, 
    appStoreUrl : String,    
    description : String, 
    viewCount : Number,
    averageRating : Number,
    maxRating : Number,
    tags : [String],
    sharingUrl : String,
    isFav : Boolean,
    userIdCreator : mongoose.Schema.Types.ObjectId,
    isTrending: Boolean,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);

GameSchema.virtual('categories', {
    ref: 'GameCategory',
    localField : 'gameCategoryIds',
    foreignField : '_id', 
    justOne : false
})

module.exports = mongoose.model('Game', GameSchema, 'Games');
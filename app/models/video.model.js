const mongoose = require('mongoose');

var moment = require('moment');
function transform(ret) {
    ret.id = ret._id;
    delete ret._id;

    ret.publishedAt = moment.unix(ret.tsPublishedAt).format("YYYY");
    delete ret.tsPublishedAt;

    if (ret.categories) {
        delete ret.videoCategoryIds;
        var i = 0;
        var ln = ret.categories.length;
        while (i < ln) {
            ret.categories[i].id = ret.categories[i]._id;
            delete ret.categories[i]._id;
            delete ret.categories[i].gradientStartColorHex;
            delete ret.categories[i].gradientEndColorHex;
            delete ret.categories[i].gradientAngleDegrees;
            delete ret.categories[i].status;
            delete ret.categories[i].userIdCreator;
            delete ret.categories[i].tsCreatedAt;
            delete ret.categories[i].tsModifiedAt;
            i++;
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

const VideoSchema = mongoose.Schema({
    title: String,
    videoCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VideoCategory' }],
    image: String,
    youtubeId: String,
    description: String,
    durationSeconds: Number,
    viewCount: Number,
    averageRating: Number,
    maxRating: Number,
    tags: [String],
    tsPublishedAt: Number,
    sharingUrl: String,
    isFav: Boolean,
    userIdCreator: mongoose.Schema.Types.ObjectId,
    isTrending: Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options);

VideoSchema.virtual('categories', {
    ref: 'VideoCategory',
    localField: 'videoCategoryIds',
    foreignField: '_id',
    justOne: false
})


module.exports = mongoose.model('Video', VideoSchema, 'Videos');
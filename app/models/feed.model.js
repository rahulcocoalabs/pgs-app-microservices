const mongoose = require('mongoose');
const moment = require("moment");
function transform(record) {
    var ret = record;
    ret.id = ret._id;
    delete ret._id;
    if (ret.authorUser) {
        delete ret.authorUserId;
        delete ret.authorUser.dob;
        delete ret.authorUser.school;
        delete ret.authorUser.syllabusId;
        delete ret.authorUser.hobbies;
        delete ret.authorUser.nationalityId;
        delete ret.authorUser.achievements;
        delete ret.authorUser.ambition;
        delete ret.authorUser.genderId;
        delete ret.authorUser.phone;
        delete ret.authorUser.userType;
        delete ret.authorUser.fatherName;
        delete ret.authorUser.fatherNationalityId;
        delete ret.authorUser.fatherProfessionId;
        delete ret.authorUser.motherName;
        delete ret.authorUser.motherNationalityId;
        delete ret.authorUser.motherProfessionId;
        delete ret.authorUser.coinCount;
        delete ret.authorUser.karmaIndex;
        delete ret.authorUser.status;
        delete ret.authorUser.tsCreatedAt;
        delete ret.authorUser.tsModifiedAt;
        delete ret.authorUser.userIdCreator;
    }
    if (ret.tsCreatedAt) {
        ret.time = moment.unix(ret.tsCreatedAt);
        delete ret.tsCreatedAt;
    }
    if (ret.emotions) {
        var len = ret.emotions.length;
        var i = 0;
        while (i < len) {
            if (ret.emotions[i].user) {
                // delete ret.emotions[i].userId;
                delete ret.emotions[i].user.dob;
                delete ret.emotions[i].user.image;
                delete ret.emotions[i].user.school;
                delete ret.emotions[i].user.syllabusId;
                delete ret.emotions[i].user.hobbies;
                delete ret.emotions[i].user.nationalityId;
                delete ret.emotions[i].user.achievements;
                delete ret.emotions[i].user.ambition;
                delete ret.emotions[i].user.genderId;
                delete ret.emotions[i].user.phone;
                delete ret.emotions[i].user.userType;
                delete ret.emotions[i].user.fatherName;
                delete ret.emotions[i].user.fatherNationalityId;
                delete ret.emotions[i].user.fatherProfessionId;
                delete ret.emotions[i].user.motherName;
                delete ret.emotions[i].user.motherNationalityId;
                delete ret.emotions[i].user.motherProfessionId;
                delete ret.emotions[i].user.coinCount;
                delete ret.emotions[i].user.karmaIndex;
                delete ret.emotions[i].user.status;
                delete ret.emotions[i].user.tsCreatedAt;
                delete ret.emotions[i].user.tsModifiedAt;
                delete ret.emotions[i].user.userIdCreator;
            }
            i++;
        }

    }
    ret.emotionsInfo = {
        userEmotion: null,
        total: 0,
        love: 0,
        happy: 0,
        heartfilled: 0,
        surprise: 0,
        sad: 0,
        angry: 0,
    };
    if (ret.emotions && Array.isArray(ret.emotions) && ret.emotions.length) {
        ret.emotionsInfo.total = ret.emotions.length;
        var j = 0;
        //emotion names currently hardcoded. not a proper way to implement
        while (j < ret.emotions.length) {
            console.log("15/12",ret);
            if (ret.emotions[j].emotion == "love")
                ret.emotionsInfo.love++;
            if (ret.emotions[j].emotion == "happy")
                ret.emotionsInfo.happy++;
            if (ret.emotions[j].emotion == "heartfilled")
                ret.emotionsInfo.heartfilled++;
            if (ret.emotions[j].emotion == "surprise")
                ret.emotionsInfo.surprise++;
            if (ret.emotions[j].emotion == "sad")
                ret.emotionsInfo.sad++;
            if (ret.emotions[j].emotion == "angry")
                ret.emotionsInfo.angry++;
            // if(ret.emotions[j].userId == ret.authorUserId)
                ret.emotionsInfo.userEmotion = null;
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
}

const FeedsSchema = mongoose.Schema({
    title: String,

    description: String,
    images: [String],
    video: String,
    documents: [String],
    authorUserId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    creatorDob: Number,
    creatorLanguage: String,
    startAge: Number,
    endAge: Number,
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language'},
    emotions: [{
        emotion: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    youTubeLink: String,
    feedType: String,
    type: String,
    sharingUrl: String,
    isFav: Boolean,
    rank : Number,
    isApproved: Number,
    isRejected: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options)

FeedsSchema.virtual('authorUser', {
    ref: 'User',
    localField: 'authorUserId',
    foreignField: '_id',
    justOne: true
});

/*FeedsSchema.virtual('emotions.user', {
    ref: 'User',
    localField: 'emotions.userId',
    foreignField: '_id',
    justOne: true
}); */
FeedsSchema.virtual('emotionsInfo');


module.exports = mongoose.model('Feed', FeedsSchema, 'Feeds');
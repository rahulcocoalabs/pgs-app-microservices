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
           if (ret.user) {
                delete ret.userId;
                delete ret.user.status;
                delete ret.user.tsCreatedAt;
                delete ret.user.tsModifiedAt;
                delete ret.user.school;
                delete ret.user.syllabusId;
                delete ret.user.hobbies;
                delete ret.user.nationalityId;
                delete ret.user.achievements;
                delete ret.user.ambition;
                delete ret.user.genderId;
                delete ret.user.dob;
                delete ret.user.phone;
                delete ret.user.userType;
                delete ret.user.fatherName;
                delete ret.user.fatherNationalityId;
                delete ret.user.fatherProfessionId;
                delete ret.user.motherName;
                delete ret.user.motherNationalityId;
                delete ret.user.motherProfessionId;
                delete ret.user.coinCount;
                delete ret.user.karmaIndex;
            }
            
        }
    }
};
const ReviewSchema = mongoose.Schema({
    title : String,
    description : String,
    itemId : mongoose.Schema.Types.ObjectId,
    itemType : String,
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating : Number,
    maxRating : Number,
    status : Number,
    tsCreatedAt : Number,
    tsModifiedAt : Number
}, options);

ReviewSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
module.exports = mongoose.model('Review', ReviewSchema, 'Reviews');
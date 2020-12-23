const mongoose = require('mongoose');

var moment = require('moment');
function transform(record) {
    var ret = record;
    ret.id = ret._id;
    ret.gender = ret.genderId;
    ret.syllabus = ret.syllabusId;
    ret.nationality = ret.nationalityId;
    ret.fatherNationality = ret.fatherNationalityId;
    ret.motherNationality = ret.motherNationalityId;
    ret.fatherProfession = ret.fatherProfessionId;
    ret.mothersProfession = ret.motherProfessionId;
    ret.language = ret.language;
    delete ret._id;
    delete ret.genderId;
    delete ret.nationalityId;
    delete ret.syllabusId;
    delete ret.motherNationalityId;
    delete ret.fatherNationalityId;
    delete ret.motherProfessionId;
    delete ret.fatherProfessionId;

    ret.dob = moment(ret.dob.toLocaleString()).format("DD MMMM YYYY");
    if (ret.syllabus) {
        delete ret.syllabusId;
        delete ret.syllabus._id;
        delete ret.syllabus.status;
        delete ret.syllabus.tsCreatedAt;
        delete ret.syllabus.tsModifiedAt;
        delete ret.syllabus.userIdCreator;
    }
    if (ret.gender) {
        delete ret.genderId;
        delete ret.gender._id;
        delete ret.gender.status;
        delete ret.gender.tsCreatedAt;
        delete ret.gender.tsModifiedAt;
        delete ret.gender.userIdCreator;
    }
    if (ret.language) {
        delete ret.language._id;
        delete ret.language.flagImage;
        delete ret.language.translatedName;
        delete ret.language.status;
        delete ret.language.tsCreatedAt;
        delete ret.language.tsModifiedAt;
        delete ret.language.userIdCreator;
    }
    if (ret.nationality) {
        delete ret.nationalityId;
        delete ret.nationality._id;
        delete ret.nationality.status;
        delete ret.nationality.tsCreatedAt;
        delete ret.nationality.tsModifiedAt;
        delete ret.nationality.userIdCreator;
    }
    if (ret.fatherNationality) {
        delete ret.fatherNationalityId;
        delete ret.fatherNationality._id;
        delete ret.fatherNationality.status;
        delete ret.fatherNationality.tsCreatedAt;
        delete ret.fatherNationality.tsModifiedAt;
        delete ret.fatherNationality.userIdCreator;
    }
    if (ret.fatherProfession) {
        delete ret.fatherProfessionId;
        delete ret.fatherProfession._id;
        delete ret.fatherProfession.status;
        delete ret.fatherProfession.tsCreatedAt;
        delete ret.fatherProfession.tsModifiedAt;
        delete ret.fatherProfession.userIdCreator;
    }
    if (ret.motherNationality) {
        delete ret.motherNationalityId;
        delete ret.motherNationality._id;
        delete ret.motherNationality.status;
        delete ret.motherNationality.tsCreatedAt;
        delete ret.motherNationality.tsModifiedAt;
        delete ret.motherNationality.userIdCreator;
    }
    if (ret.mothersProfession) {
        delete ret.motherProfessionId;
        delete ret.mothersProfession._id;
        delete ret.mothersProfession.status;
        delete ret.mothersProfession.tsCreatedAt;
        delete ret.mothersProfession.tsModifiedAt;
        delete ret.mothersProfession.userIdCreator;
    }
    if (ret.hobbies) {
        // delete ret.hobbyIds;
        // var i = 0;
        // var len = ret.hobbies.length;
        // while (i < len) {
        //     delete ret.hobbies[i].status;
        //     delete ret.hobbies[i].userIdCreator;
        //     delete ret.hobbies[i].tsCreatedAt;
        //     delete ret.hobbies[i].tsModifiedAt;
        //     i++;
        // }
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

const UserSchema = mongoose.Schema({
    firstName: String,
    middlename: String,
    lastName: String,
    email: String,
    password: String,
    dob: Date,
    image: String,
    school: String,
    syllabusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Syllabus' },
    hobbyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hobby' }],
    // hobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hobby' }],
    nationalityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nationality' },
    achievements: String,
    ambition: String,
    genderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gender' },
    language: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],
    countryCode: String,
    phone: String,
    email: String,
    address: String,
    avaregeRating:Number,
    rateduser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userType: String,
    fatherName: String,
    fatherNationalityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nationality' },
    fatherProfessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profession' },
    motherName: String,
    motherNationalityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nationality' },
    motherProfessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profession' },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    coinCount: Number,
    
    karmaIndex: String,
    coinHistory: Array,
    profileCompletion :Number,
    isSocialLogin : Boolean,
    socialPhotoUrl : String,
    socialLogins : [{
        id : String,
        provider : String,
        status : Number,
        tsCreatedAt : Number,
        tsModifiedAt: Number
    }],
    facebookId : String,
    referralCode : String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    favouriteTutor : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    favouriteClass : [{ type: mongoose.Schema.Types.ObjectId, ref: 'OnlineClass' }],
    tutorCourseIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorCourse' }],
    tutorSubjectIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorSubject' }],
    tutorClassIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorClass' }],
    tutorCategoryIds : [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorCategory' }],
    courceDescription : String,
    isPopular: Boolean,
    sampleVideo : String,
    lat : Number,
    lng : Number,
    location : String,
    isTutor : Boolean,
    institution: String,
    achievementsOrAwards: String,
    yearOfExperience: Number,
    isBlocked : Boolean,
    isDeactivated : Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
}, options)
UserSchema.virtual('syllabus', {
    ref: 'Syllabus',
    localField: 'syllabusId',
    foreignField: '_id',
    justOne: true
});
UserSchema.virtual('nationality', {
    ref: 'Nationality',
    localField: 'nationalityId',
    foreignField: '_id',
    justOne: true
});
UserSchema.virtual('gender', {
    ref: 'Gender',
    localField: 'genderId',
    foreignField: '_id',
    justOne: true
});
UserSchema.virtual('fathersNationality', {
    ref: 'Nationality',
    localField: 'fatherNationalityId',
    foreignField: '_id',
    justOne: true
});
UserSchema.virtual('fathersProfession', {
    ref: 'Profession',
    localField: 'fatherProfessionId',
    foreignField: '_id',
    justOne: true
});
UserSchema.virtual('mothersNationality', {
    ref: 'Nationality',
    localField: 'motherNationalityId',
    foreignField: '_id',
    justOne: true
});
UserSchema.virtual('mothersProfession', {
    ref: 'Profession',
    localField: 'motherProfessionId',
    foreignField: '_id',
    justOne: true
});
// UserSchema.virtual('hobbies', {
//     ref: 'Hobby',
//     localField: 'hobbies',
//     foreignField: '_id',
//     justOne: false
// });
module.exports = mongoose.model('User', UserSchema, 'Users');
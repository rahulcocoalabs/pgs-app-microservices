const Otp = require('../models/otp.model.js');
const User = require('../models/user.model');
const Setting = require('../models/setting.model');
const TutorCategory = require('../models/tutorCategory.model');
const TutorCourse = require('../models/tutorCourse.model');
const TutorClass = require('../models/tutorClass.model');
const TutorSubject = require('../models/tutorSubject.model');
const TutorRequest = require('../models/tutorRequest.model');
const TutorProfileUpdateRequest = require('../models/tutorProfileUpdateRequest.model');
const OnlineClass = require('../models/onlineClass.model');
const Rating = require('../models/rating.model');
const AppointmentClassRequest = require('../models/appointmentClassRequest.model');
const EarnCoin = require('../models/earnCoin.model');
const LoginBanner = require('../models/loginBanner.model');

const InnovationChallenge = require('../models/innovationChallenge.model');
const otplib = require('otplib');
const uuidv4 = require('uuid/v4');
var config = require('../../config/app.config.js');
var smsConfig = config.sms;
var otpConfig = config.otp;
var eventsConfig = config.events;
var tutorsConfig = config.tutors;
var classConfig = config.class;

const superagent = require('superagent');

const JWT_KEY = config.jwt.key;
const JWT_EXPIRY_SECONDS = config.jwt.expirySeconds;



var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var crypto = require("crypto");

const Notifications = require('../models/notification.model.js');
const CharityDonation = require('../models/charityDonation.model.js');
const Charities = require('../models/charity.model.js');
const Nationalities = require('../models/nationality.model.js');
const Syllabus = require('../models/syllabus.model.js');
const Profession = require('../models/profession.model.js');
const Gender = require('../models/gender.model.js');
const Hobby = require('../models/hobby.model.js');
const Events = require('../models/event.model.js');
const EventCategory = require('../models/eventCategory.model.js');
const EventBookings = require('../models/eventBooking.model.js');
const Country = require('../models/country.model');
const State = require('../models/state.model');
const City = require('../models/city.model');
var gateway = require('../components/gateway.component.js');

var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var charitiesConfig = config.charities;
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');
const Feed = require('../models/feed.model.js');
const sgMail = require('@sendgrid/mail');

var bcrypt = require('bcryptjs');
const requestForTutorModel = require('../models/requestForTutor.model.js');
const salt = bcrypt.genSaltSync(10);

var usersConfig = config.users;
karmaConfig = config.karma;


exports.create = async (req, res) => {
    console.log('flag ..1');
    var warnings = [];
    var profileCompletion;
    var hobbyIds = [];
    var coinType = constants.COIN_PROFILE_COMPLETION;
    var inviteApp = constants.COIN_INVITE_APP;
    if (!req.body.firstName || !req.body.phone
        || !req.body.dob || !req.body.language
        || !req.body.email || !req.body.school
        || !req.body.password || !req.body.countryCode
        || !req.body.countryId || !req.body.stateId
        || !(req.body.cityId || req.body.city)) {
        var errors = [];
        if (!req.body.firstName) {
            errors.push({
                field: "firstName",
                message: "First Name cannot be empty"
            });
        }
        if (!req.body.dob) {
            errors.push({
                field: "dob",
                message: "Date of Birth cannot be empty"
            });
        }
        if (!req.body.school) {
            errors.push({
                field: "school",
                message: "School Name cannot be empty"
            });
        }
        // if (!req.body.syllabusId) {
        //     errors.push({
        //         field: "syllabusId",
        //         message: "Syllabus Id cannot be empty"
        //     });
        // }
        // if (req.body.syllabusId && !ObjectId.isValid(req.body.syllabusId)) {
        //     errors.push({
        //         field: "syllabusId",
        //         message: "Syllabus Id is not a valid objectId"
        //     });
        // }
        if (!req.body.language) {
            errors.push({
                field: "language",
                message: "Array of language Ids cannot be empty"
            });
        }
        if (!req.body.countryId) {
            errors.push({
                field: "countryId",
                message: "countryId cannot be empty"
            });
        }
        if (!req.body.stateId) {
            errors.push({
                field: "stateId",
                message: "stateId cannot be empty"
            });
        }
        if (!req.body.cityId) {
            errors.push({
                field: "city",
                message: "city cannot be empty"
            });
        }
        if (!req.body.city) {
            errors.push({
                field: "city",
                message: "city cannot be empty"
            });
        }
        // if (req.body.nationalityId && !ObjectId.isValid(req.body.nationalityId)) {
        //     errors.push({
        //         field: "nationalityId",
        //         message: "nationalityId is not a valid objectId"
        //     });
        // }
        // if (!req.body.genderId) {
        //     errors.push({
        //         field: "genderId",
        //         message: "Gender Id cannot be empty"
        //     });
        // }
        // if (req.body.genderId && !ObjectId.isValid(req.body.genderId)) {
        //     errors.push({
        //         field: "genderId",
        //         message: "genderId is not a valid objectId"
        //     });
        // }
        if (!req.body.countryCode) {
            errors.push({
                field: "countryCode",
                message: "countryCode cannot be empty"
            });
        }
        if (!req.body.phone) {
            errors.push({
                field: "phone",
                message: "Phone cannot be empty"
            });
        }

        if (!req.body.email) {
            errors.push({
                field: "email",
                message: "email cannot be empty"
            })
        }

        if (!req.body.password) {
            errors.push({
                field: "password",
                message: "password cannot be empty"
            })
        }
        // if (!req.body.fatherName) {
        //     errors.push({
        //         field: "fatherName",
        //         message: "Father's Name cannot be empty"
        //     });
        // }
        // if (!req.body.fatherNationalityId) {
        //     errors.push({
        //         field: "fatherNationalityId",
        //         message: "Father's Nationality Id cannot be empty"
        //     });
        // }

        // if (req.body.fatherNationalityId && !ObjectId.isValid(req.body.fatherNationalityId)) {
        //     errors.push({
        //         field: "fatherNationalityId",
        //         message: "fatherNationalityId is not a valid objectId"
        //     });
        // }
        // if (!req.body.fatherProfessionId) {
        //     errors.push({
        //         field: "fatherProfessionId",
        //         message: "Father's Profession Id cannot be empty"
        //     });
        // }

        // if (req.body.fatherProfessionId && !ObjectId.isValid(req.body.fatherProfessionId)) {
        //     errors.push({
        //         field: "fatherProfessionId",
        //         message: "fatherProfessionId is not a valid objectId"
        //     });
        // }
        // if (!req.body.motherName) {
        //     errors.push({
        //         field: "motherName",
        //         message: "Mother's Name cannot be empty"
        //     });
        // }
        // if (!req.body.motherNationalityId) {
        //     errors.push({
        //         field: "motherNationalityId",
        //         message: "Mother's Nationality Id cannot be empty"
        //     });
        // }

        // if (req.body.motherNationalityId && !ObjectId.isValid(req.body.motherNationalityId)) {
        //     errors.push({
        //         field: "motherNationalityId",
        //         message: "motherNationalityId is not a valid objectId"
        //     });
        // }
        // if (!req.body.motherProfessionId) {
        //     errors.push({
        //         field: "motherProfessionId",
        //         message: "Mother's Profession Id cannot be empty"
        //     });
        // }
        // if (!req.file) {
        //   errors.push({
        //     field: "image",
        //     message: "image is missing"
        //   });
        // }
        if (req.file) {
            if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
                errors.push({
                    field: "image",
                    message: "Unsupported image format. Can upload only jpg/png"
                });
            }
            if (req.file.size > 2097152) {
                errors.push({
                    field: "image",
                    message: "Image File size exceeded 2mb limit"
                });
            }
        }
        return res.status(200).send({
            success: 0,
            errors: errors,
            code: 200
        });
    }

    var emailCheck = await User.findOne({
        email: req.body.email,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking email already exists or not',
                error: err
            }
        })
    if (emailCheck && (emailCheck.success !== undefined) && (emailCheck.success === 0)) {
        return res.send(emailCheck);
    }

    if (emailCheck) {
        return res.send({
            success: 0,
            message: "Email ID already exists"
        })
    } else {

        if (req.body.hobbyIds && req.body.hobbyIds.length) {
            var i = 0;
            var len = req.body.hobbyIds.length;
            var hobbyIds = [];
            while (i < len) {
                if (ObjectId.isValid(req.body.hobbyIds[i]))
                    hobbyIds.push(ObjectId(req.body.hobbyIds[i]));
                else
                    warnings.push({
                        field: hobbyIds,
                        message: "Invalid hobby Id"
                    });
                i++;
            }
            console.log(warnings);
        }

        if (req.body.hobbyIds) {
            if (req.body.hobbyIds.length > 0) {
                hobbyIds = [];
                var i = 0;
                var len = req.body.hobbyIds.length;
                hobbies = [];
                while (i < len) {
                    hobbyIds[i] = req.body.hobbyIds[i].id;
                    i++;
                }

            }
        }




        var imagePath = req.file ? req.file.filename : null;

        if (req.body.firstName && req.body.middlename && req.body.lastName && req.body.dob && req.body.school && req.body.syllabusId && req.body.nationalityId && req.body.achievements && req.body.ambition && req.body.genderId && req.body.phone && req.body.address && req.body.fatherName && req.body.fatherNationalityId && req.body.fatherProfessionId && req.body.motherName && req.body.motherNationalityId && req.body.motherProfessionId) {
            profileCompletion = 1;
            // coinCount = 10;
        } else {
            profileCompletion = 0;
            coinCount = 0;
        }

        function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        const hash = bcrypt.hashSync(req.body.password, salt);

        var referralCode = makeid(6);

        console.log("dob : " + req.body.dob)
        var dobObj = await getDayMonthAndYear(req.body.dob);
        const user = new User({
            firstName: req.body.firstName,
            email: req.body.email,
            password: hash,
            middlename: req.body.middlename || null,
            lastName: req.body.lastName || null,
            dob: req.body.dob,
            dayInDob: dobObj.dayInDob,
            monthInDob: dobObj.monthInDob,
            yearInDob: dobObj.yearInDob,
            image: imagePath || null,
            school: req.body.school ? req.body.school : null,
            syllabusId: req.body.syllabusId ? req.body.syllabusId : null,
            hobbyIds: hobbyIds || null,
            // hobbies: hobbyIds || null,
            language: req.body.language ? req.body.language : null,
            nationalityId: req.body.nationalityId ? req.body.nationalityId : null,
            achievements: req.body.achievements ? req.body.achievements : null,
            ambition: req.body.ambition ? req.body.ambition : null,
            status: 1,
            genderId: req.body.genderId ? req.body.genderId : null,
            countryId: req.body.countryId,
            stateId: req.body.stateId,
            cityId: req.body.cityId,
            city: req.body.city,
            countryCode: req.body.countryCode,
            phone: req.body.phone,
            address: req.body.address ? req.body.address : null,
            userType: req.body.userType || "Student",
            fatherName: req.body.fatherName ? req.body.fatherName : null,
            fatherNationalityId: req.body.fatherNationalityId ? req.body.fatherNationalityId : null,
            fatherProfessionId: req.body.fatherProfessionId ? req.body.fatherProfessionId : null,
            motherName: req.body.motherName ? req.body.motherName : null,
            motherNationalityId: req.body.motherNationalityId ? req.body.motherNationalityId : null,
            motherProfessionId: req.body.motherProfessionId ? req.body.motherProfessionId : null,
            profileCompletion: profileCompletion,
            referralCode: referralCode,
            isTutor: false,
            isDeactivated: false,
            coinCount: 0,
            isSocialLogin: false,
            coinHistory: [],
            karmaIndex: null,
            avaregeRating: 0
        });

        if (req.body.referralCode) {
            var checkReferral = req.body.referralCode;
            var filterReferralCode = {
                referralCode: checkReferral
            }
            // User.findOne({
            //   email: req.body.email,
            //   status: 1
            // }).then(result => {
            //   if (result) {
            //     return res.send({
            //       success: 0,
            //       message: 'User already exists'
            //     })
            //   }
            User.findOne(filterReferralCode).then(async result => {
                if (!result) {
                    return res.send({
                        success: 0,
                        message: `user with referral code ${checkReferral} not found`
                    })
                } else {
                    // updateCoinCount(result._id, inviteApp, function (err, profileCompletionRes) {})
                    User.findOne({
                        phone: req.body.phone,
                        email: req.body.email,
                        status: 1
                    }).then(result => {
                        if (result) {
                            return res.send({
                                success: 0,
                                message: 'User already exists.Try with a different number'
                            })
                        } else {
                            user.save()
                                .then(async data => {
                                    let updateCoinReqObj = {
                                        userId: result._id,
                                        coinType: inviteApp,
                                        url: constants.API_UPDATE_COIN,
                                    };

                                    updateCoinCount(updateCoinReqObj, function (err, trendingBooksRes) { });
                                    var loginResponse = await getLoginResponse(req.body.email)
                                    loginResponse.referralCode = data.referralCode;
                                    return res.status(200).send(loginResponse);
                                });
                        }
                    });


                }
            })
            // })
        } else {
            User.findOne({
                phone: req.body.phone,
                status: 1
            }).then(async result => {
                if (result) {
                    return res.send({
                        success: 0,
                        message: 'User already exists.Try with a different number'
                    })
                } else {
                    user.save()
                        .then(async data => {
                            if (profileCompletion == 1) {
                                // updateCoinCount(data.id, coinType, function (err, profileCompletionRes) {});

                                let updateCoinReqObj = {
                                    userId: data.id,
                                    coinType,
                                    url: constants.API_UPDATE_COIN,
                                };

                                updateCoinCount(updateCoinReqObj, function (err, trendingBooksRes) { });
                            }
                            var loginResponse = await getLoginResponse(req.body.email)
                            loginResponse.referralCode = data.referralCode;
                            return res.status(200).send(loginResponse);

                        }).catch(err => {
                            res.status(500).send({
                                success: 0,
                                message: err.message || "Some error occurred while creating the User."
                            });
                        });
                }
            })
        }
    }
};

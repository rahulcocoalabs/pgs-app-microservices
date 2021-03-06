const Otp = require('../models/otp.model.js');
const User = require('../models/user.model');
const Setting = require('../models/setting.model');
const TutorCategory = require('../models/tutorCategory.model');
const TutorCourse = require('../models/tutorCourse.model');
const TutorClass = require('../models/tutorClass.model');
const TutorSubject = require('../models/tutorSubject.model');
const TutorRequest = require('../models/tutorRequest.model');
const classRequest = require('../models/onlineClassRequests.model');
const TutorProfileUpdateRequest = require('../models/tutorProfileUpdateRequest.model');
const OnlineClass = require('../models/onlineClass.model');
const Rating = require('../models/rating.model');
const AppointmentClassRequest = require('../models/appointmentClassRequest.model');
const EarnCoin = require('../models/earnCoin.model');
const LoginBanner = require('../models/loginBanner.model');
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
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

const Alumni = require('../models/alumni.model.js');
const axios = require('axios');

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

function updateCoinCount(reqObj, callback) {
  let url = reqObj.url;
  delete reqObj.url;
  gateway.patchWith(url, reqObj, function (err, result) {
    if (err) {
      console.log("Error while updating coin..." + url);

    }
    callback(err, result);
  });

};

function updateCoin(reqObj, callback) {
  let bearer = reqObj.bearer;
  let url = reqObj.url;
  delete reqObj.bearer;
  delete reqObj.url;
  // gateway.patchWith(url, reqObj, function (err, result) {
  gateway.patchWithAuth(url, reqObj, bearer, function (err, result) {
    console.log(result);
    if (err) {
      console.log("Error while updating coin..." + url);

    }
    callback(err, result);
  });

};

// function accountsController(methods, options) {


//rakesh 
// innovation challenge
exports.addNewinnovation = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;

  var contestId = req.params.id;
  if (!contestId) {
    return res.send({
      success: 0,
      message: "context id not available"
    })
  }
  if (userId == undefined) {
    return res.send({
      success: 0,
      message: "user id not available"
    })
  }

  var params = req.body;

  if (!params) {
    return res.send({
      success: 0,
      message: "body not available"
    })
  }

  if (!params.title) {
    return res.send({
      success: 0,
      message: "title not available"
    })
  }

  if (!params.price) {
    return res.send({
      success: 0,
      message: "price not available"
    })
  }
  if (!params.description) {
    return res.send({
      success: 0,
      message: "description not available"
    })

  }

  const count = await InnovationChallenge.countDocuments({ status: 1, userId: userId, contestId: contestId }).catch(err => {
    return {
      success: 0,
      message: err.message
    }
  })

  if (count && (count.success !== undefined) && (count.success === 0)) {
    return res.send(count);
  }

  if (count >= 1) {
    return res.send({
      success: 0,
      message: "you have already submitted  a challenge"
    })
  }

  const newInnovationChallenge = new InnovationChallenge({
    userId: userId,
    title: params.title,
    contestId: contestId,
    description: params.description,
    price: params.price,
    status: 1,
    tsCreatedAt: Date.now(),
    tsModifiedAt: null
  })

  var saved = await newInnovationChallenge.save().catch((err) => { return { succes: 0, message: err.message } })

  if (saved && saved.success != undefined && saved.success === 0) {
    return res.send(saved)
  }

  return res.send({
    success: 1,
    message: "saved successfully"
  })
}

// *** Gennerate and send OTP ***
exports.generate = async (req, res) => {
  if (!req.body.countryCode || !req.body.phone) {
    var errors = [];
    if (!req.body.countryCode) {
      errors.push({
        field: "countryCode",
        message: "Country code cannot be empty"
      });
    }
    if (!req.body.phone) {
      errors.push({
        field: "phone",
        message: "Phone cannot be empty"
      });
    }
    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }
  // -----------------check reg-----------------------------
  let phoneNumber = req.body.countryCode + req.body.phone + "";
  let user = await User.find({
    phone: phoneNumber
  });
  if (user.length > 0) {

    const apiToken = uuidv4();

    const secret = otplib.authenticator.generateSecret();
    const token = otplib.authenticator.generate(secret);

    const expiry = Date.now() + (otpConfig.expirySeconds * 1000);


    //update old otp records to used if any
    // var query = {
    //   "phone": req.body.phone,
    //   "countryCode": req.body.countryCode,
    //   "isUsed": false
    // };
    // var update = {
    //   isUsed: true
    // };
    // var options = {
    //   new: true
    // };
    // Otp.updateMany(query, update, options, function (err, res) {
    //   if (err) {
    //     console.log('got an error');
    //   }
    // });

    msg91.send(req.body.countryCode + req.body.phone, token + " is your OTP ", function (err, response) {
      if (response) {
        const otp = new Otp({
          countryCode: req.body.countryCode,
          phone: req.body.phone,
          isUsed: false,
          userToken: token,
          apiToken: apiToken,
          smsResponse: response,
          trials: 0,
          expiry: parseInt(expiry)
        });

        otp.save()
          .then(data => {
            var otpGenerateResponse = {
              countryCode: data.countryCode,
              phone: data.phone,
              otp: token,
              apiToken: data.apiToken,
              isRegistered: 1
            }
            res.send(otpGenerateResponse);
          }).catch(err => {
            res.status(200).send({
              success: 0,
              errors: [{
                field: "phone",
                message: err.message || "Some error occurred while generating otp"
              }],
              code: 200
            });
          });
      } else {
        if (err) {
          return res.status(200).send({
            success: 0,
            errors: [{
              field: null,
              message: err || "Some error occured. Couldnot send sms"
            }],
            code: 200
          });
        }
      }
    });
    // send otp
    // if otp is sent

  } else {
    return res.send({
      success: 0,
      message: "Kindly register with your profile",
      code: 200,
      isRegistered: 0
    });
  }
}

// **** Validate OTP ****
exports.validate = async (req, res) => {
  var phone = req.body.phone;
  var userToken = req.body.userToken;
  var apiToken = req.body.apiToken;
  if (!phone || !userToken || !apiToken) {
    var errors = [];
    if (!phone) {
      errors.push({
        field: "phone",
        message: "Phone cannot be empty"
      });
    }
    if (!userToken) {
      errors.push({
        field: "userToken",
        message: "userToken cannot be empty"
      });
    }
    if (!apiToken) {
      errors.push({
        field: "apiToken",
        message: "apiToken cannot be empty"
      });
    }
    return res.send({
      success: 0,
      statusCode: 400,
      errors: errors,
    });
  };
  var findCriteria = {
    userToken: userToken,
    apiToken: apiToken,
    isUsed: false
  }
  var otpData = await Otp.findOne(findCriteria);
  if (otpData) {
    let currentTime = Date.now();

    var otpData1 = await Otp.findOne({
      userToken: userToken,
      apiToken: apiToken,
      isUsed: false,
      expiry: {
        $gt: currentTime
      }
    });
    if (otpData1 === null) {
      return res.send({
        success: 0,
        message: 'otp expired,please resend otp to get a new one'
      })
    } else {
      var user = await User.findOne({
        phone: phone,
        status: 1
      });
      if (!user) {
        return res.status(200).send({
          success: 0,
          message: 'User not found'
        })
      }
      var payload = {
        userId: user.id,
        firstName: user.firstName,
        phone: user.phone,
      };
      var token = jwt.sign({
        data: payload,
        // exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS
      }, JWT_KEY, {
        expiresIn: '30 days'
      });
      var filter = {
        userToken: userToken,
        apiToken: apiToken
      };
      var update = {
        isUsed: true
      };
      let updateOtpData = await Otp.findOneAndUpdate(filter, update, {
        new: true,
        useFindAndModify: false
      });
      res.send({
        success: 1,
        token: token,
        statusCode: 200,
        message: 'Otp verified successfully'
      })
    }
  } else {
    return res.send({
      success: 0,
      message: 'Otp does not matching'
    })
  }
};

// **** User sign-up ****

exports.create = async (req, res) => {
  console.log("sign up after  otp started")
  var warnings = [];
  var profileCompletion;
  var hobbyIds = [];

  var coinType = constants.COIN_PROFILE_COMPLETION;
  var inviteApp = constants.COIN_INVITE_APP;
  if (!req.body.firstName || !req.body.phone
    || !req.body.dob || !req.body.email
    || !req.body.password || !req.body.countryCode
    ) {
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
    // if (!req.body.school) {
    //   errors.push({
    //     field: "school",
    //     message: "School Name cannot be empty"
    //   });
    // }
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
    // if (!req.body.language) {
    //   errors.push({
    //     field: "language",
    //     message: "Array of language Ids cannot be empty"
    //   });
    // }
    // if (!req.body.countryId) {
    //   errors.push({
    //     field: "countryId",
    //     message: "countryId cannot be empty"
    //   });
    // }
    // if (!req.body.stateId) {
    //     errors.push({
    //         field: "stateId",
    //         message: "stateId cannot be empty"
    //     });
    // }
    // if (!req.body.cityId) {
    //     errors.push({
    //         field: "city",
    //         message: "city cannot be empty"
    //     });
    // }
    // if (!req.body.city) {
    //     errors.push({
    //         field: "city",
    //         message: "city cannot be empty"
    //     });
    // }
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
      stateId: req.body.stateId ? req.body.stateId : null,
      cityId: req.body.cityId ? req.body.cityId : null,
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

exports.create1 = async (req, res) => {
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
    || !req.body.cityId) {
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
      city: req.body.cityId,
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

// **** Get user details ****

exports.getUserDetails = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var ObjectId = require('mongoose').Types.ObjectId;
  var isValidId = ObjectId.isValid(userId);
  if (!isValidId) {
    var responseObj = {
      success: 0,
      status: 401,
      errors: [{
        field: "id",
        message: "id is invalid"
      }]
    }
    res.send(responseObj);
    return;
  }
  var filters = {
    _id: userId,
    status: 1
  }
  var queryProjection = {
    firstName: 1,
    isDeactivated: 1,
    middlename: 1,
    lastName: 1,
    dob: 1,
    image: 1,
    school: 1,
    syllabusId: 1,
    hobbyIds: 1,
    nationalityId: 1,
    language: 1,
    achievements: 1,
    ambition: 1,
    genderId: 1,
    countryCode: 1,
    phone: 1,
    email: 1,
    address: 1,
    userType: 1,
    fatherName: 1,
    fatherNationalityId: 1,
    fatherProfessionId: 1,
    motherName: 1,
    motherNationalityId: 1,
    motherProfessionId: 1,
    hobbies: 1,
    coinCount: 1,
    karmaIndex: 1,
    password: 1,
    isTutor: 1,
    isDeactivated: 1,
    countryId: 1,
    stateId: 1,
    city: 1,
  }
  // get data
  User.findOne(filters, queryProjection).populate(['syllabusId', {
    path: 'language',
    select: 'name'
  }, 'nationalityId', 'genderId', 'fatherNationalityId', 'fatherProfessionId', 'motherNationalityId', 'motherProfessionId', 'hobbyIds', 'countryId', 'stateId', 'cityId']).then(userDetail => {
    if (!userDetail) {
      var responseObj = {
        success: 0,
        status: 200,
        errors: [{
          field: "id",
          message: "User not found with id"
        }]
      }
      res.send(responseObj);
      return;
    }
    userDetail = userDetail.toObject();
    if (userDetail.password && userDetail.password !== null) {
      userDetail.isPasswordExists = true;
    } else {
      userDetail.isPasswordExists = false;

    }
    userDetail.imageBase = usersConfig.imageBase || "";
    res.send(userDetail);

  });
};

// **** Get kara-index ****
exports.getKarmaIndex = (req, res) => {
  var responseObj = {
    imageBase: karmaConfig.imageBase,
    totalValue: 283,
    statitics: {
      x: {
        label: "Months",
        values: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      },
      y: {
        label: "Karma Index",
        values: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
      },
      activity: [{
        name: "Donation 1",
        earnedValue: 8,
        coinsDonated: 5,
        count: 20,
        icon: karmaConfig.defaultIcon,
        color: "#f1948a"
      },
      {
        name: "Donation 2",
        earnedValue: 12,
        coinsDonated: 5,
        count: 30,
        icon: karmaConfig.defaultIcon,
        color: "#aed6f1"
      },
      {
        name: "Donation 3",
        earnedValue: 10,
        coinsDonated: 5,
        count: 40,
        icon: karmaConfig.defaultIcon,
        color: "#fcf3cf"
      },
      {
        name: "Donation 4",
        earnedValue: 10,
        coinsDonated: 5,
        count: 50,
        icon: karmaConfig.defaultIcon,
        color: "#e8daef"
      }
      ]
    }
  };
  res.send(responseObj);
}


exports.updateProfile = async (req, res) => {




  // verification 

  try {
    const token = req.body.token;
    const userDetails = jwt.verify(token, JWT_KEY);
    const data = userDetails.data;
    const userId = data.userId;
    const user = await User.findOne({
      _id: userId,
      status: 1
    });
    if (!user) {
      throw new Error()
    }
    req.identity = userDetails;
    req.token = token;


  } catch (error) {
    res.status(401).send({
      error: 'Not authorized to access this resource'
    })
  }

  var userData = req.identity.data;
  var userId = userData.userId;


  var update = {};
  const params = req.body;

  if (!params) {
    return res.send({
      success: 0,
      message: "no parameter found"
    });
  }

  if (params.dob) {


    var formattedDate = moment(params.dob, 'DD MMMM YYYY');
    update.dob = formattedDate;

  }

  if (params.syllabusId) {
    update.syllabusId = ObjectId(params.syllabusId);
  }
  if (params.nationalityId) {
    update.nationalityId = ObjectId(params.nationalityId);
  }
  if (params.language) {
    update.language = params.language;
  }
  if (params.genderId) {
    update.genderId = ObjectId(params.genderId);
  }
  if (params.fatherNationalityId) {
    update.fatherNationalityId = ObjectId(params.fatherNationalityId);
  }
  if (params.fatherProfessionId) {
    update.fatherProfessionId = ObjectId(params.fatherProfessionId);
  }
  if (params.motherNationalityId) {
    update.motherNationalityId = ObjectId(params.motherNationalityId);
  }
  if (params.motherProfessionId) {
    update.motherProfessionId = ObjectId(params.motherProfessionId);
  }
  if (params.phone) {
    update.phone = params.phone;
  }
  if (params.countryCode) {
    update.countryCode = params.countryCode;
  }
  if (params.school) {
    update.school = params.school;
  }

  //need to validate country/state & city
  if (params.countryId) {
    update.countryId = params.countryId;
  }
  if (params.stateId) {
    update.stateId = params.stateId;
  }
  if (params.city) {
    update.city = params.city;
  }
  if (params.cityId) {
    update.cityId = params.cityId;
  }
  if (params.firstName) {
    update.firstName = params.firstName;
  }
  if (params.countryCode) {
    update.countryCode = params.countryCode;
  }

  if (params.fatherName) {
    update.fatherName = params.fatherName;
  }

  update.socialSignUpCompleted = true;



  if (params.phone){
    var usr = await User.findOne({status:1,_id:userId}).catch(err => {
      return {
        success:0,
        message:"some thing went wrong",
        error:err.message
      }
    })

    if (usr && usr.success != undefined && usr.success === 0){
      return res.send(usr)
    }

    if (usr.phone == undefined || usr.phone == null){
       var cnt = await User.countDocuments({status:1,phone:params.phone}).catch(err => {
         return {
           success : 0,
           message:"some thing went wrong",
           error:err.message
         }
       })

       if (cnt && cnt.success != undefined && cnt.success === 0){
         return res.send(cnt)
       }

       if (cnt > 0){
         return res.send({
           success :0,
           message : "mobile number already exist try another number"
         })
       }

    }

   
  }

  

  let value = await User.updateOne({ status: 1, _id: userId }, update).catch(err => { return { succes: 0, message: err.message } });
  if (value && value.success != undefined && value.success === 0) {
    return res.send(value);
  }

  var userInfo = await User.findOne({ status: 1, _id: userId }).catch(err => { return { success: 0, message: err.message } });

  var isEmailUpdated = false;
  var isDobLanguageUpdated = false;
  if (userInfo && userInfo.success != undefined && userInfo.success === 0) {
    return res.send(userInfo);
  }
  if (userInfo.email != undefined) {
    isEmailUpdated = true;
  }
  if (userInfo.dob != undefined && userInfo.language != undefined) {
    isDobLanguageUpdated = true;
  }

  var loginResponse = await getLoginResponse(userInfo.email);

  var token = loginResponse.token;

  return res.send(
    {
      success: 1,
      userDetails: userInfo,
      isEmailUpdated,
      isDobLanguageUpdated,
      token,
      message: "updated successfully"
    }
  )
}

exports.update = async (req, res) => {


  console.log("body -> ", req.body);
  var params = req.body;
  var reqFields = [];
  var hobbyIds = [];
  var userData = req.identity.data;
  var userId = userData.userId;

  if (params.password != undefined && params.oldPassword != undefined) {

    var y = await changePassword(params.password, params.oldPassword, userId);
    

    if (y.success === 1){
      return res.send({
        success: 1,
        message: "updated"
      })
    }
    else{
      return res.send({
        success: 0,
        message: "old password does not match"
      })
    }
  }

  if (params.password != undefined) {
    var x = await addPassword(params.password, userId);
    return res.send({
      success: 1,
      message: "updated"
    })
  }

  // var validation = await utilities.validateMandatoryFields(params,reqFields,res).catch(err=>{
  //   return {
  //     success:0,
  //     message:"can not validate mandatory fields",
  //     error:err.message
  //   }
  // });
  // if (validation && validation.sucess && validation.success === 1){
  //   return res.send(validation);
  // }

  //update parameter 

  var update = {};

  if (!params) {
    return res.send({
      success: 0,
      message: "no parameter found"
    });
  }

  // if (update.dob) {

  //   console.log("dob : " + update.dob)
  //   var formattedDate = moment(update.dob, 'DD MMMM YYYY');
  //   update.dob = formattedDate;
  //   console.log("formattedDate : " + formattedDate)
  // }


  if (params.firstName) {
    update.firstName = params.firstName;
  }
  if (params.syllabusId) {
    update.syllabusId = ObjectId(params.syllabusId);
  }
  if (params.nationalityId && params.nationalityId != "") {
    update.nationalityId = ObjectId(update.params);
  }
  if (params.stateId && params.stateId != "") {
    update.nationalityId = ObjectId(update.params);
  }
  if (params.language) {
    update.language = params.language;
  }
  if (params.genderId) {
    update.genderId = ObjectId(params.genderId);
  }
  if (params.fatherNationalityId) {
    update.fatherNationalityId = ObjectId(params.fatherNationalityId);
  }
  if (params.fatherProfessionId) {
    update.fatherProfessionId = ObjectId(params.fatherProfessionId);
  }
  if (params.motherNationalityId) {
    update.motherNationalityId = ObjectId(params.motherNationalityId);
  }
  if (params.motherProfessionId) {
    update.motherProfessionId = ObjectId(params.motherProfessionId);
  }
  if (params.phone) {
    update.phone = params.phone;
  }
  if (params.countryCode) {
    update.countryCode = params.countryCode;
  }
  if (params.school) {
    update.school = params.school;
  }
  if (params.fatherName) {
    update.fatherName = params.fatherName;
  }
  if (params.motherName) {
    update.motherName = params.motherName;
  }

  //need to validate country/state & city
  if (params.countryId && params.countryId != "") {
    update.countryId = params.countryId;
  }
  if (params.stateId && params.stateId != "") {
    update.stateId = params.stateId;
  }
  if (params.city) {
    update.city = params.city;
  }
  if (params.achievements) {
    update.achievements = params.achievements;
  }
  if (params.ambition) {
    update.ambition = params.ambition;
  }
  if (params.address) {
    update.address = params.address;
  }

  if (params.password) {

    console.log("password ->", params, params.password)
    const passwordValue = params.password.toString();
    var hash = bcrypt.hashSync(passwordValue, salt);
    update.password = hash;
  }


  if (update.hobbyIds) {
    if (update.hobbyIds.length > 0) {
      hobbyIds = [];
      var i = 0;
      var len = update.hobbyIds.length;
      update.hobbies = [];
      while (i < len) {
        hobbyIds[i] = update.hobbyIds[i].id;
        i++;
      }
      update.hobbies = hobbyIds;
      update.hobbyIds = [];
      update.hobbyIds = hobbyIds;
    }
  }


  if (req.file) {
    console.log("image ->");
    update.image = req.file.filename
  }
  var unwantedFields = ["_id", "userType", "coinCount", "password_hash", "auth_key", "status", "tsCreatedAt", "tsModifiedAt", "karmaIndex", "rev"];
  var j = 0;
  var field = null;
  while (j < unwantedFields.length) {
    field = unwantedFields[j];
    if (params[field] !== undefined)
      delete params[field];
    j++;
  }

  var filter = {
    _id: userId,
    status: 1
  };

  var options = {
    new: true
  };

  var checkPasswordObj = await checkPassword(update, userId)
  if (checkPasswordObj && (checkPasswordObj.success !== undefined) && (checkPasswordObj.success === 0)) {
    return res.send(checkPasswordObj);
  }

  if (checkPasswordObj.isPasswordUpdate) {
    update.password = checkPasswordObj.password;
  }

  var update1 = update;

  console.log("07/04", update);

  var update = await User.updateOne(filter, update).catch(err => {

    return {
      success: 0,
      message: "updation failed",
      error: err.message
    }
  })

  if (update && update.succes && update.success === 0) {
    return res.send(update)
  }

  var proj = {
    firstName: 1,
    profileCompletion: 1,
    isDeactivated: 1,
    middlename: 1,
    lastName: 1,
    dob: 1,
    image: 1,
    school: 1,
    syllabusId: 1,
    hobbyIds: 1,
    nationalityId: 1,
    language: 1,
    achievements: 1,
    ambition: 1,
    genderId: 1,
    countryCode: 1,
    phone: 1,
    email: 1,
    address: 1,
    userType: 1,
    fatherName: 1,
    fatherNationalityId: 1,
    fatherProfessionId: 1,
    motherName: 1,
    motherNationalityId: 1,
    motherProfessionId: 1,
    hobbies: 1,
    coinCount: 1,
    karmaIndex: 1,
    password: 1,
    isTutor: 1,
    isDeactivated: 1,
    countryId: 1,
    stateId: 1,
    city: 1,
  }

  var userInfo = await User.findOne(filter, proj).populate(['syllabusId', {
    path: 'language',
    select: 'name'
  }, 'nationalityId', 'genderId', 'fatherNationalityId', 'fatherProfessionId', 'motherNationalityId', 'motherProfessionId', 'hobbyIds', 'countryId', 'stateId']).catch(err => {
    return {
      success: 0,
      message: "did not get info of user",
      error: err.message
    }
  })

  userInfo = userInfo.toObject();

  console.log("13/04", userInfo)

  if (userInfo.profileCompletion == 0) {

    var infoFlag = "";
    if ((userInfo.dob != undefined) && (userInfo.syllabus != undefined) && (userInfo.countryId != undefined)
      && (userInfo.fatherNationality != undefined) && (userInfo.fatherProfession != undefined)
      && (userInfo.motherNationality != undefined) && (userInfo.mothersProfession != undefined) && (userInfo.image != undefined)) {


      if ((userInfo.language == undefined) || (userInfo.language.length == 0)) {
        return res.send({
          success: 1,

          flag: 1,
          message: "profile updated"
        })
      }

      var updateProfCompletion = await User.updateOne(filter, { profileCompletion: 1, $inc: { coinCount: 10 } }).catch(err => {
        return {
          success: 0,
          message: "profile updation related with coin count failed",
          error: err.message
        }
      })

      if (updateProfCompletion && updateProfCompletion.success && updateProfCompletion.success === 0) {
        return res.send(updateTutorProfile);
      }
      return res.send({
        success: 1,
        flag: 2,
        message: "profile updated "
      })
    }
    else {
      var array = [];
      for (var key in userInfo) {

        console.log(key + " -> " + userInfo[key]);

      }
      return res.send({
        success: 1,
        flag: 3,
        flag1: userInfo.genderId,
        flag2: userInfo.dob,
        flag3: userInfo.syllabus,
        flag4: userInfo.countryId,
        flag5: userInfo.fatherNationality,
        flag6: userInfo.fatherProfession,
        flag7: userInfo.motherNationality,
        flag8: userInfo.mothersProfession,
        flag10: userInfo,
        flag11: update1,
        message: "profile updated "
      })
    }
  }
  else {
    return res.send({
      success: 1,

      flag: 4,
      message: "profile updatd "
    })
  }

}


exports.update1 = async (req, res) => {
  let bearer = req.headers['authorization'];
  var params = req.body;
  var reqFields = [];
  var hobbyIds = [];
  var userData = req.identity.data;
  var userId = userData.userId;
  var coinType = constants.COIN_PROFILE_COMPLETION;
  utilities.validateMandatoryFields(params, reqFields, res).catch(function () {

  }).then(async function (missingFields) {
    if (missingFields.length)
      return;

    var update = params;
    if (update.dob) {

      var formattedDate = moment(update.dob, 'DD MMMM YYYY');
      update.dob = formattedDate;


    }
    if (update.syllabusId) {
      update.syllabusId = ObjectId(update.syllabusId);
    }
    if (update.nationalityId) {
      update.nationalityId = ObjectId(update.nationalityId);
    }
    if (update.language) {
      update.language = update.language;
    }
    if (update.genderId) {
      update.genderId = ObjectId(update.genderId);
    }
    if (update.fatherNationalityId) {
      update.fatherNationalityId = ObjectId(update.fatherNationalityId);
    }
    if (update.fatherProfessionId) {
      update.fatherProfessionId = ObjectId(update.fatherProfessionId);
    }
    if (update.motherNationalityId) {
      update.motherNationalityId = ObjectId(update.motherNationalityId);
    }
    if (update.motherProfessionId) {
      update.motherProfessionId = ObjectId(update.motherProfessionId);
    }
    if (update.phone) {
      update.phone = update.phone;
    }
    if (update.countryCode) {
      update.countryCode = update.countryCode;
    }
    if (update.hobbyIds) {
      if (update.hobbyIds.length > 0) {
        hobbyIds = [];
        var i = 0;
        var len = update.hobbyIds.length;
        update.hobbies = [];
        while (i < len) {
          hobbyIds[i] = update.hobbyIds[i].id;
          i++;
        }
        update.hobbies = hobbyIds;
        update.hobbyIds = [];
        update.hobbyIds = hobbyIds;
      }
    }

    // if (update.password) {
    //   const hash = bcrypt.hashSync(update.password, salt);
    //   update.password = hash;
    // }
    if (req.file) {
      update.image = req.file.filename
    }
    var unwantedFields = ["_id", "userType", "coinCount", "password_hash", "auth_key", "status", "tsCreatedAt", "tsModifiedAt", "karmaIndex", "rev"];
    var j = 0;
    var field = null;
    while (j < unwantedFields.length) {
      field = unwantedFields[j];
      if (params[field] !== undefined)
        delete params[field];
      j++;
    }

    var filter = {
      _id: userId,
      status: 1
    };

    var options = {
      new: true
    };
    var checkPasswordObj = await checkPassword(update, userId)
    if (checkPasswordObj && (checkPasswordObj.success !== undefined) && (checkPasswordObj.success === 0)) {
      return res.send(checkPasswordObj);
    }

    if (checkPasswordObj.isPasswordUpdate) {
      update.password = checkPasswordObj.password;
    }
    User.findOne(filter).then(data => {
      if (data.profileCompletion == 0) {
        if (update.dob && update.syllabusId && update.nationalityId && update.fatherNationalityId && update.fatherProfessionId && update.motherNationalityId && update.motherProfessionId) {
          update.profileCompletion = 1;
          // updateCoinCount(userId, coinType, function (err, profileCompletionRes) {});

          // let updateCoinReqObj = {
          //   userId,
          //   coinType,
          //   bearer,
          //   url: constants.API_UPDATE_COIN,
          // };

          // updateCoin(updateCoinReqObj, function (err, trendingBooksRes) { });
        }

      }

      User.findOneAndUpdate(filter, update, options, function (err, response) {
        if (err) {
          console.log(err);
          var responseObj = {
            success: 0,
            status: 500,
            errors: [{
              field: "",
              message: "Error updating review " + err
            }]
          }
        }
        if (!err) {
          responseObj = {
            success: 1,
            imageBase: usersConfig.imageBase,
            image: response.image,
            message: "Successfully updated..."
          };
        }

        res.send(responseObj);
        return;


      });


    })


  });

};

// **** Update coin ****

exports.updateCoin = (req, res) => {
  var params = req.body;

  if (!params.userId) {
    return res.send({
      field: "userId",
      message: "userId required"
    });
  }

  if (!params.coinType) {
    return res.send({
      field: "coinType",
      message: "coinType required"
    });

  } else {
    if (params.coinType == constants.COIN_INVITE_APP) {
      params.coinCount = constants.COIN_COUNT_INVITE_APP;
    } else if (params.coinType == constants.COIN_PROFILE_COMPLETION) {
      params.coinCount = constants.COIN_COUNT_PROFILE_COMPLETION;
    } else if (params.coinType == constants.COIN_RATE_APP) {
      params.coinCount = constants.COIN_COUNT_RATE_APP;
    } else if (params.coinType == constants.COIN_REVIEW_APP) {
      params.coinCount = constants.COIN_COUNT_REVIEW_APP;
    } else if (params.coinType == constants.COIN_SHARE_APP) {
      params.coinCount = constants.COIN_COUNT_SHARE_APP;
    } else if (params.coinType == constants.COIN_TIME_SPEND) {
      params.coinCount = constants.COIN_COUNT_TIME_SPEND;
    } else if (params.coinType == constants.COIN_MOST_LIKE) {
      params.coinCount = constants.COIN_COUNT_MOST_LIKE;
    } else if (params.coinType == constants.COIN_NEW_POST) {
      params.coinCount = constants.COIN_COUNT_NEW_POST;
    } else {
      return res.send({
        field: "coinType",
        message: "coinType value incorrect"
      });
    }
  }
  var objectId = ObjectId(params.userId);

  User.findById(objectId, (err, user) => {
    if (err) {
      var responseObj = {
        success: 0,
        status: 500,
        errors: [{
          field: "",
          message: "Error retrieving user data " + err
        }]
      }
      res.send(responseObj);
      return;
    };
    let coinCount = parseInt(user.coinCount) + parseInt(params.coinCount);
    let coinHistory = [];
    var currentTime = moment().unix();
    if (user.coinHistory) {
      coinHistory = user.coinHistory;
    }
    let coinObj = {
      coinType: params.coinType,
      coinDate: currentTime,
      coinCount: parseInt(params.coinCount)
    }
    user.coinCount = coinCount + "";
    coinHistory.push(coinObj);

    user.coinCount = coinCount + "";
    user.coinHistory = coinHistory;
    user.save((err, updatedCat) => {
      if (err) {
        var responseObj = {
          success: 0,
          status: 500,
          errors: [{
            field: "",
            message: "Error updating coin " + err
          }]
        }
      }
      if (!err) {
        responseObj = {
          success: 1,
          message: "Successfully updated..."
        };
      }
      res.send(responseObj);
      return;
    });

  });

};

// **** Weekly most-like ****

exports.checkWeekMostLike = async (req, res) => {
  let startOfWeek = moment().startOf('week').unix();
  let endOfWeek = moment().endOf('week').unix();
  // console.log("startOfWeek " + startOfWeek)
  // console.log("endOfWeek " + endOfWeek)
  // let startOfWeek = 1563433518;
  // let endOfWeek = 1579334286;

  let mostLikePost = await Feed.aggregate([{
    $match: {
      tsCreatedAt: {
        $gte: startOfWeek,
        $lte: endOfWeek
      },
    }
  },
  {
    $project: {
      ysize: {
        $size: {
          "$ifNull": ["$emotions", []]
        }
      },
      authorUserId: "$authorUserId",
      tsCreatedAt: "$tsCreatedAt"
    }
  },
  {
    $project: {
      _id: "$_id",
      _numYsid: "$ysize",
      authorUserId: "$authorUserId",
      tsCreatedAt: "$tsCreatedAt",
    }
  },
  {
    $sort: {
      _numYsid: -1,
      tsCreatedAt: -1
    }
  },
  {
    $limit: 1
  }
  ])
  if (mostLikePost.length > 0) {
    let userId = mostLikePost[0].authorUserId;
    let coinType = constants.COIN_MOST_LIKE;
    console.log("userId : " + userId)

    let updateCoinReqObj = {
      userId,
      coinType,
      url: constants.API_UPDATE_COIN,
    };

    updateCoinCount(updateCoinReqObj, function (err, trendingBooksRes) {
      res.send(mostLikePost);
      return;
    });

    // updateCoinCount(userId, coinType, function (err, reviewsRes) {
    //   res.send(mostLikePost);
    //   return;
    // });
  } else {
    res.send([]);
    return;
  }
};

// **** Get coin-count ****

exports.getCoinCount = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var unReadNotificationCount;
  var coinCount;
  var userImage;
  var coinVideoObj = {};
  var loginBannerObj = {};
  var unReadNotificationCount = await Notifications.countDocuments({
    userId,
    markAsRead: 0,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting unread notification count',
        error: err
      }
    })
  if (unReadNotificationCount && unReadNotificationCount.success && (unReadNotificationCount.success === 0)) {
    return res.send(unReadNotificationCount);
  }

  var userData = await User.findOne({
    _id: userId,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting user data',
        error: err
      }
    })
  if (userData && userData.success && (userData.success === 0)) {
    return res.send(userData);
  }

  var earnCoinData = await EarnCoin.findOne({
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting earn coin video details',
        error: err
      }
    })
  if (earnCoinData && earnCoinData.success && (earnCoinData.success === 0)) {
    return res.send(earnCoinData);
  }
  if (earnCoinData) {
    coinVideoObj = earnCoinData;
  } else {
    coinVideoObj = null;
  }


  var loginBannerData = await LoginBanner.findOne({
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting login banner details',
        error: err
      }
    })
  if (loginBannerData && loginBannerData.success && (loginBannerData.success === 0)) {
    return res.send(loginBannerData);
  }
  if (loginBannerData) {
    loginBannerObj = loginBannerData;
  } else {
    loginBannerObj = null;
  }

  coinCount = userData.coinCount;
  userImage = userData.image;
  var responseObj = {
    success: 1,
    userImage: userImage,
    imageBase: usersConfig.imageBase,
    unReadNotifications: unReadNotificationCount,
    coinCount: coinCount,
    loginBannerDetails: loginBannerObj,
    coinVideoDetails: coinVideoObj,
  }

  return res.send(responseObj)
};

exports.getMyDonations = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var filter = {
    userId: userId
  }
  var queryProjection = {};
  var i;
  var id;
  var title;
  var image;
  var amount;
  var donatedDate;
  var items = [];
  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || charitiesConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : charitiesConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };
  CharityDonation.find(filter, queryProjection, pageParams).populate('charityId', Charities).then(result => {
    CharityDonation.countDocuments(filter, function (err, itemsCount) {
      for (i = 0; i < result.length; i++) {
        var response = {};
        var charityDetails = result[i];
        id = charityDetails._id;
        title = charityDetails.charityId.title;
        image = charityDetails.charityId.image;
        amount = charityDetails.amount;
        donatedDate = charityDetails.tsCreatedAt;
        var date = moment.unix(donatedDate).format("MM/DD/YYYY");
        response.id = id;
        response.title = title;
        response.image = image;
        response.amount = amount;
        response.date = date;
        items.push(response);
      }
      totalPages = itemsCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;
      res.send({
        success: 1,
        imageBase: charitiesConfig.imageBase,
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages,
        items: items,

      })
    })
  })
}

exports.getMyCoinsSummary = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var filter = {
    _id: userId
  };
  var i;
  var coinHistory;
  var coinType;
  var coinCount;
  var totalEarnedCoins;
  var coinCollectedDate;
  var totalSpentCoins = 0;
  totalCoins = 0;
  var items = [];
  User.findOne(filter).limit(10).then(result => {
    totalEarnedCoins = result.coinCount;
    coinHistory = result.coinHistory;
    for (i = 0; i < coinHistory.length; i++) {
      var coinSummary = {};
      coinType = coinHistory[i].coinType;
      coinCount = coinHistory[i].coinCount;
      coinCollectedDate = coinHistory[i].coinDate;
      totalCoins = totalCoins + coinHistory[i].coinCount;
      var date = moment.unix(coinCollectedDate).format("MM/DD/YYYY");
      coinSummary.coinType = coinType;
      coinSummary.coinCount = coinCount;
      coinSummary.date = date;
      items.push(coinSummary);
    }
    totalSpentCoins = totalCoins - totalEarnedCoins;
    var spentCoinsSummary = [{}]
    res.send({
      success: 1,
      totalEarnedCoins: totalEarnedCoins,
      totalSpentCoins: totalSpentCoins,
      earnedCoinsSummary: items,
      spentCoinsSummary: spentCoinsSummary,
    })
  })
};

exports.getMyBookings = (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || charitiesConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : charitiesConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var filter = {
    userId: userId,
    status: 1
  };
  var pageParams = {
    skip: offset,
    limit: perPage
  };
  var queryProjection = {
    participateCount: 1,
    eventId: 1
  };
  EventBookings.find(filter, queryProjection, pageParams).populate('eventId', 'title image venue eventDate eventFromTime').then(items => {
    EventBookings.countDocuments(filter).then(itemsCount => {
      totalPages = itemsCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;
      res.send({
        success: 1,
        message: 'My bookings listed successfully',
        imageBase: eventsConfig.imageBase,
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages,
        items: items,

      })
    })
  })


}


// add rating to class 
exports.addratingToClass = async (req, res) => {
  let rating = req.body.rating;
  let userId = req.identity.data.userId;
  let classId = req.params.id;
  if (!rating || !classId) {
    let errors = [];
    if (!rating) {
      errors.push({
        field: 'rating',
        message: 'rating cannot be empty'
      })
    }
    if (!classId) {
      errors.push({
        field: 'classId',
        message: 'classId cannot be empty'
      })
    }
    return res.status(400).send({
      success: 0,
      errors: errors
    })

  }


  var objectRating = {};
  objectRating.rating = rating;
  objectRating.userId = userId;
  objectRating.classId = classId;
  objectRating.type = "class";
  objectRating.status = 1;
  objectRating.tsCreatedAt = Date.now();
  objectRating.tsModifiedAt = null;
  var save = await new Rating(objectRating).save().catch(error => {
    return {
      success: 0,
      message: error.message
    }
  });
  if (save && save.success && save.success == 0) {
    return res.send(save)
  }
  if (save) {
    var object = {};
    object = { $push: { rateduser: userId } }


    var update = await OnlineClass.updateOne({ _id: req.params.id }, object).catch(error => {
      return {
        success: 0,
        message: error.message
      }
    });

    if (update && update.success && update.success === 0) {
      return res.send(update)
    }
    var updateAvgRates = await avaregeRates("class", classId)

    if (updateAvgRates == 1) {
      return res.send({
        success: 1,

        message: 'successfully saved rating'
      });
    }
    else {
      return res.send({
        success: 0,

        message: updateAvgRates.message
      });
    }
  }
}
// rate tutor 

exports.addratingTutor = async (req, res) => {
  let rating = req.body.rating;
  let userId = req.identity.data.userId;
  let tutorId = req.params.id;
  if (!rating || !tutorId) {
    let errors = [];
    if (!rating) {
      errors.push({
        field: 'rating',
        message: 'rating cannot be empty'
      })
    }
    if (!tutorId) {
      errors.push({
        field: 'tutorId',
        message: 'tutorId cannot be empty'
      })
    }
    return res.status(400).send({
      success: 0,
      errors: errors
    })

  }


  var objectRating = {};
  objectRating.rating = rating;
  objectRating.userId = userId;
  objectRating.tutorId = tutorId;
  objectRating.type = "tutor";
  objectRating.status = 1;
  objectRating.tsCreatedAt = Date.now();
  objectRating.tsModifiedAt = null;
  var save = await new Rating(objectRating).save().catch(error => {
    return {
      success: 0,
      message: error.message
    }
  });
  if (save && save.success && save.success == 0) {
    return res.send(save)
  }
  if (save) {
    var object = {};
    object = { $push: { rateduser: userId } }


    var update = await User.updateOne({ _id: req.params.id }, object).catch(error => {
      return {
        success: 0,
        message: error.message
      }
    });

    if (update && update.success && update.success === 0) {
      return res.send(update)
    }
    var updateAvgRates = await avaregeRates("tutor", tutorId)

    if (updateAvgRates.success == 1) {
      return res.send({
        success: 1,

        message: 'successfully saved rating'
      });
    }
    else {
      return res.send({
        success: 0,

        message: updateAvgRates.message
      });
    }
  }
}
// average ratings 

async function avaregeRates(type, id) {

  if (type == constants.CLASS_RATES) {
    var array = await Rating.find({ classId: id }).catch(error => {
      return { success: 0, message: error.message }
    })

    if (array && array.succes && array.sucess === 0) {
      return { success: 0, message: array.message }
    }
    // return res.send(array);

    var totalRates = 0
    for (i in array) {
      totalRates += array[i].rating
    }
    console.log(totalRates, "test")
    var avg = totalRates / array.length;
    console.log("avarege rating ", avg, array);
    var update = await OnlineClass.updateOne({ _id: id }, { avaregeRating: avg }).catch(err => {
      return { succes: 0, message: err.message }
    })
    if (update && update.succes && update.succes === 1) {
      return { success: 0, message: update.message }
    }
    return 1;
  }

  if (type == constants.TUTOR_RATES) {
    var array = await Rating.find({ tutorId: id }).catch(error => {
      return { success: 0, message: error.message }
    })

    if (array && array.succes && array.sucess === 0) {
      return { success: 0, message: array.message }
    }
    // return res.send(array);

    var totalRates = 0
    for (i in array) {
      totalRates += array[i].rating
    }
    console.log(totalRates, "test")
    var avg = totalRates / array.length;
    var update = await User.updateOne({ _id: id }, { avaregeRating: avg }).catch(err => {
      return { succes: 0, message: err.message }
    })
    console.log('test1', update, id, avg, array)
    if (update && update.succes && update.succes === 1) {
      return { success: 0, message: update.message }
    }
    return { success: 1, message: " added average rating" };
  }
}

// *** Login with email and password ***
exports.loginWithEmail = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  console.log("entered", req.body);

  if (!email || !password) {
    let errors = [];
    if (!email) {
      errors.push({
        field: 'email',
        message: 'email cannot be empty'
      })
    }
    if (!password) {
      errors.push({
        field: 'password',
        message: 'password cannot be empty'
      })
    }
    return res.status(400).send({
      success: 0,
      errors: errors
    })
  }
  try {
    let checkUser = await User.findOne({
      email: email,
      status: 1
    }, {
      coinCount: 1,
      email: 1,
      firstName: 1,
      lastName: 1,
      middlename: 1,
      image: 1,
      password: 1,
      isTutor: 1,
      dob: 1
    });
    if (!checkUser) {
      return res.status(200).send({
        success: 0,
        message: 'User not found'
      })
    }
    if (checkUser.password !== undefined && checkUser.password !== null) {
      let matched = await bcrypt.compare(password, checkUser.password);
      if (matched) {
        var payload = {
          userId: checkUser.id
        };
        var token = jwt.sign({
          data: payload,
        }, JWT_KEY, {
          expiresIn: '30 days'
        });

        return res.send({
          success: 1,
          statusCode: 200,
          userDetails: checkUser,
          token,
          flag: "ok",
          message: 'Successfully logged in'
        })

      } else {
        return res.send({
          success: 0,
          statusCode: 401,
          message: 'Incorrect password'
        })
      }
    } else {
      return res.status(200).send({
        success: 0,
        message: 'Normal registraion not done'
      })
    }
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: 'Something went wrong while login'
    })
  }
}

// *** Send OTP to registered email to reset password ***

exports.sendOtp_1 = async (req, res) => {
  console.log("request for otp started")
  let params = req.body;
  var mobile = params.phone;
  var email = params.emailId;
  let countryCode = params.countryCode;

  if (!mobile) {
    return res.status(400).send({
      success: 0,
      field: 'mobile',
      message: 'mobile cannot be empty'
    })
  }
  if (!countryCode) {
    return res.status(400).send({
      success: 0,
      field: 'countryCode',
      message: 'countryCode cannot be empty'
    })
  }
  console.log("params are", params);
  // var otp = Math.floor(1000 + Math.random() * 9000);
  // const apiToken = uuidv4();
  // var expiry = Date.now() + (otpConfig.expirySeconds * 1000);
  // console.log("flag2")
  try {
    // let checkUser = await User.findOne({
    //   email: email,
    //   status: 1
    // });
    // if (!checkUser) {
    //   return res.status(200).send({
    //     success: 0,
    //     message: 'Email is not registered with us'
    //   })
    // }
    // var resetPasswordToken = crypto.randomBytes(20).toString('hex');
    // var resetPasswordExpires = Date.now() + 3600000; //expires in an hour
    // console.log("flag3")
    // var filter = {
    //   email: email,
    //   status: 1
    // };
    // var update = {
    //   resetPasswordToken: resetPasswordToken,
    //   resetPasswordExpires: resetPasswordExpires
    // };
    // let updateUser = await User.findOneAndUpdate(filter, update).catch(err=>{
    //   return {success:0,message:err.message}
    // });
    // if (updateUser && updateUser.success !== undefined && updateUser.success === 0) {
    //   console.log("flag7")
    //   return res.send(updateUser);
    // }
    // let testAccount = await nodemailer.createTestAccount().catch(err=>{
    //   return {success:0,message:err.message}
    // });
    // if (testAccount && testAccount.success !== undefined && testAccount.success === 0) {
    //   console.log("flag8")
    //   return res.send(testAccount);
    // }
    // console.log("flag4")
    // let mailTransporter = await nodemailer.createTransport({
    //   host: testAccount.smtp.host,
    //   port: testAccount.smtp.port,
    //   secure: testAccount.smtp.secure,
    //   auth: {
    //     user: testAccount.user,
    //     pass: testAccount.pass
    //   }
    // });

    // let mailDetails = {
    //   from: 'xyz@gmail.com',
    //   to: 'shefinshafi54@gmail.com',
    //   subject: 'Test mail',
    //   text: `OTP is ${otp} `
    // };

    // // send mail with defined transport object
    // let info = await mailTransporter.sendMail(mailDetails).catch(err=>{
    //   return {success:0,message:err.message}
    // });

    // if (info && (info.success != undefined) && info.success === 0){
    //   return res.send(info);
    // }

    var country = params.countryCode;
    if (!country) {
      res.send({
        success: 0,
        message: "provide country id"
      })
    }

    // if (country == "+91") {
    //   var mobileNum = countryCode + mobile;
    //   var otpResponse = await send_otp(mobileNum);

    //   if (otpResponse == undefined) {
    //     return res.send({
    //       success: 0,
    //       message: 'Something went wrong, Your country code may be wrong please check'
    //     })
    //   }
    //   res.status(200).send({
    //     success: 1,
    //     message: 'OTP is sent to your registered phone number for verification',
    //     item: otpResponse
    //   });
    // }
    // else {
    var mobileNum = countryCode + mobile;
    var otpResponse = await send_otp_bymail_1(email, mobileNum);
    console.log(otpResponse);
    if (otpResponse == undefined) {
      return res.send({
        success: 0,
        message: 'Something went wrong while sending OTP'
      })
    }
    res.status(200).send({
      success: 1,
      message: 'OTP is sent to your registered email for verification',
      item: otpResponse
    });
    // }


    // console.log("flag5")
    // const newOtp = new Otp({
    //   email: email,
    //   isUsed: false,
    //   userToken: otp,
    //   apiToken: apiToken,
    //   expiry: expiry,
    //   status: 1,
    //   tsCreatedAt: new Date(),
    //   tsModifiedAt: null
    // });
    // var saveOtp = await newOtp.save();
    // res.status(200).send({
    //   success: 1,
    //   email: email,
    //   otp: otp,
    //   resetPasswordToken: resetPasswordToken,
    //   apiToken: apiToken,
    //   messageSentTo: info.messageId,
    //   previewURL: nodemailer.getTestMessageUrl(info),
    //   message: 'mail sent successfully'
    // });
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message,
      err: err.message
    })
  }
}

//   **** Verify OTP ****  

exports.verifyOtp = async (req, res) => {

  console.log("verification of otp started")
  var params = req.body;
  var otp = params.otp;
  var phone = params.phone;
  var email = params.emailId;
  var countryCode = params.countryCode;
  var apiToken = params.apiToken;
  if (!phone || !otp || !apiToken) {
    let errors = [];
    if (!phone) {
      errors.push({
        field: 'phone',
        message: 'phone cannot be empty'
      })
    }
    if (!otp) {
      errors.push({
        field: 'otp',
        message: 'otp cannot be empty'
      })
    }
    if (!apiToken) {
      errors.push({
        field: 'apiToken',
        message: 'apiToken cannot be empty'
      })
    }

    return res.status(400).send({
      success: 0,
      errors: errors
    })
  }
  var phoneNo = phone;
  try {
    var filter = {
      userToken: otp,
      $or: [{ phone: phoneNo }, { email: email }],
      apiToken: apiToken,
      isUsed: false
    };

    console.log(filter, "flag");
    var otpData = await Otp.findOne(filter);

    if (otpData) {
      var currentTime = Date.now();
      console.log(currentTime)
      var otpData1 = await Otp.findOne({
        phone: phoneNo,
        userToken: otp,
        apiToken: apiToken,
        isUsed: false,
        expiry: {
          $gt: currentTime
        }
      });
      if (otpData1 === null) {
        return res.send({
          success: 0,
          message: 'otp expired,please resend otp to get a new one'
        })
      } else {
        var filter = {
          phone: phone,
          userToken: otp,
          apiToken: apiToken
        };
        var update = {
          isUsed: true
        };
        var updateOtpData = await Otp.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false
        });
        return res.status(200).send({
          success: 1,
          message: 'Otp verified successfully'
        })
      }
    } else {
      return res.send({
        success: 0,
        message: 'Otp does not matching'
      })
    }
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
};

// *** Send email to recover passsword ***
exports.recover = async (req, res) => {
  var email = req.body.email;
  if (!email) {
    return res.send({
      success: 0,
      message: 'Email is required'
    })
  }
  let findCriteria = {
    email: email,
    status: 1
  };
  let findUser = await User.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while chech user email',
        error: err
      }
    })
  if (findUser && (findUser.success !== undefined) && (findUser.success === 0)) {
    return res.send(findUser);
  }
  if (!findUser) {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.'
    })
  }
  let resetPasswordToken = crypto.randomBytes(20).toString('hex');
  let resetPasswordExpires = Date.now() + 3600000; //expires in an hour
  let filter = {
    email: email,
    status: 1
  };
  let update = {
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpires: resetPasswordExpires
  };

  let user = await User.findOneAndUpdate(filter, update, {
    new: true,
    useFindAndModify: false
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while updating token',
        error: err
      }
    })
  if (user && (user.success !== undefined) && (user.success === 0)) {
    return res.send(user);
  }

  // let link = "http://" + req.headers.host + "/accounts/reset/" + user.resetPasswordToken;

  var settingData = await Setting.findOne({
    key: constants.SEND_GRID_AUTH_KEY,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting sendgrid data',
        error: err
      }
    })
  if (settingData && (settingData.success !== undefined) && (settingData.success === 0)) {
    return res.send(settingData);
  }
  if (settingData) {
    let link = config.resetpassword.root + user.resetPasswordToken;
    const mailmsg = "You can reset your password by clicking this link" + "   " + link;
    sgMail.setApiKey(settingData.value);


    const x = await sendMail(mailmsg, email, "Password reset link from PGS App");

    if (x && (x == 1)) {
      return res.json({
        success: 0,
        message: "Mail could not be sent"
      })
    }

    return res.send({
      success: 1,
      success: 1,
      email,
      resetPasswordToken,
      message: 'A reset email has been sent to ' + email + '.'

    })
  } else {
    return res.json({
      success: 0,
      message: "Right now Mail sending feature not enabled"
    })
  }
  // let testAccount = await nodemailer.createTestAccount();
  // let mailTransporter = await nodemailer.createTransport({
  //   host: testAccount.smtp.host,
  //   port: testAccount.smtp.port,
  //   secure: testAccount.smtp.secure,
  //   auth: {
  //     user: testAccount.user,
  //     pass: testAccount.pass
  //   }
  // });

  // let mailDetails = {
  //   from: 'xyz@gmail.com',
  //   to: 'shefinshafi54@gmail.com',
  //   subject: "Password change request",
  //   text: `Hi ${user.firstName} \n 
  //   Please click on the following link ${link} to reset your password. \n\n 
  //   If you did not request this, please ignore this email and your password will remain unchanged.\n`
  // };

  // // send mail with defined transport object
  // let info = await mailTransporter.sendMail(mailDetails);

}


// **** Reset password ****
exports.resetPassword = async (req, res) => {
  let password = req.body.password;
  if (!password) {
    return res.status(400).send({
      success: 0,
      message: 'password cannot be empty'
    })
  }
  try {
    var checkToken = await User.findOne({
      resetPasswordToken: req.params.token,
      status: 1,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });
    if (!checkToken) {
      return res.status(400).json({
        success: 0,
        message: 'Password reset token is invalid or has expired.'
      });
    } else {
      //Set the new password
      const hash = bcrypt.hashSync(password, salt);
      var update = {
        password: hash,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      };
      var filter = {
        resetPasswordToken: req.params.token,
        status: 1
      };
      let updateUser = await User.findOneAndUpdate(filter, update, {
        new: true,
        useFindAndModify: false
      });
      res.status(200).send({
        success: 1,
        message: 'Your password has been updated.'
      });
    }
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: 'something went wrong while resetting password'
    })
  }
}

async function addPassword(password, userId) {

  var userData = User.findOne({ status: 1, _id: userId }).catch(err => { return { success: 0, message: err, message } })

  if (userData && userData.success != undefined && userData.success == 0) {
    return userData
  }

  if (userData.password != undefined) {

    return { success: 0 };
  }
  else {
    const hash = bcrypt.hashSync(password, salt);
    var update = {
      password: hash,

    };
    var filter = {
      _id: userId,
      status: 1
    };
    let updateUser = await User.findOneAndUpdate(filter, update, {
      new: true,
      useFindAndModify: false
    });

    var count = await Alumni.countDocuments({ status: 1, createdBy: userId });

    if (count > 0) {
      let payload = { mongoId: userId, password: hash };

      let res1 = await axios.post('https://backend.pgsedu.com/alumnis/update-user', payload);

      let data1 = res1.data;
      console.log(data1);
    }

  }
}

async function changePassword(password, oldPassword, userId) {


  var userData = await User.findOne({ status: 1, _id: userId }).catch(err => { return { success: 0, message: err, message } })

  if (userData && userData.success != undefined && userData.success == 0) {
    return userData
  }

  var passHash = userData.password;


  let matched = await bcrypt.compare(oldPassword, passHash);
  console.log('18/05',matched)
  if (matched == true) {


    const hash = bcrypt.hashSync(password, salt);



    var update = {
      password: hash,

    };
    var filter = {
      _id: userId,
      status: 1
    };
    let updateUser = await User.findOneAndUpdate(filter, update, {
      new: true,
      useFindAndModify: false
    });

    var count = await Alumni.countDocuments({ status: 1, createdBy: userId });

    if (count > 0) {
      let payload = { mongoId: userId, password: hash };

      let res1 = await axios.post('https://backend.pgsedu.com/alumnis/update-user', payload);

      let data1 = res1.data;
      console.log(data1);
    }


    return { success: 1 };
  }
  else {

    return { success: 0 ,message:"old password does not match"}
  }

}

exports. socialSignup = async (req, res) => {
  console.log("in social signup")
  var params = req.body;

  var validateRequestData = await validateSocialSignupRequest(params);
  if (validateRequestData && validateRequestData.success !== undefined && validateRequestData.success === 0) {
    return res.send(validateRequestData)
  }
  var findCriteria = {
    status: 1
  }
  var isEmailUpdated = true;
  if (validateRequestData.isProvideAnyUnique) {
    findCriteria.facebookId = params.id
    isEmailUpdated = false
  } else {
    findCriteria.email = params.email
    isEmailUpdated = true
  }

  var socialDataResponse = await checkUser(params, findCriteria);

  if (socialDataResponse && socialDataResponse.success !== undefined && socialDataResponse.success === 0) {
    return res.send(socialDataResponse)
  }
  console.log("socialDataResponse")
  console.log(socialDataResponse)
  console.log("socialDataResponse")
  var obj = {};
  obj.id = params.id;
  obj.provider = params.provider;
  obj.status = 1;
  obj.tsCreatedAt = Date.now();
  
  obj.tsModifiedAt = null;

  if (socialDataResponse && socialDataResponse.isRegistered === false) {
    function makeid(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }


    var referralCode = makeid(6);
    var userObj = {};
    if (params.email) {
      userObj.email = params.email;
    } else {
      userObj.email = null;
    }
    userObj.firstName = params.firstName;
    if (params.lastName) {
      userObj.lastName = params.lastName;
    }
    userObj.socialPhotoUrl = params.photoUrl;
    userObj.dob = null;
    userObj.language = null;
    userObj.isSocialLogin = true;

    var socialLogins = [];

    socialLogins.push(obj);

    userObj.socialLogins = socialLogins;
    userObj.password = null,
      userObj.middlename = null;
    userObj.image = null;
    userObj.school = null;
    userObj.syllabusId = null;
    userObj.hobbyIds = null;
    userObj.nationalityId = null;
    userObj.achievements = null;
    userObj.ambition = null;
    userObj.genderId = null;
    userObj.countryCode = null;
    userObj.isDeactivated = false;
    if (params.phone) {
      userObj.phone = params.phone;
    } else {
      userObj.phone = null;
    }
    if (params.provider === constants.FACEBOOK_PROVIDER && params.id) {
      userObj.facebookId = params.id;
    }
    userObj.isTutor = false;

    userObj.address = null;
    userObj.userType = "Student",
      userObj.fatherName = null;
    userObj.fatherNationalityId = null;
    userObj.fatherProfessionId = null;
    userObj.motherName = null;
    userObj.motherNationalityId = null;
    userObj.motherProfessionId = null;
    userObj.profileCompletion = 0;
    userObj.referralCode = referralCode;
    userObj.coinCount = 0;
    userObj.coinHistory = [];
    userObj.karmaIndex = null;
    userObj.avaregeRating = 0;
    userObj.status = 1;
    userObj.tsCreatedAt = Date.now();
    userObj.tsModifiedAt = null;

    var newUserObj = new User(userObj);
    var newUserData = await newUserObj.save()
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while save user data',
          error: err
        }
      })
    if (newUserData && (newUserData.success !== undefined) && (newUserData.success === 0)) {
      return res.send(newUserData);
    }

    newUserData = await setLoginResponse(findCriteria, socialDataResponse, isEmailUpdated)
    if (newUserData && (newUserData.success !== undefined) && (newUserData.success === 0)) {
      return res.send(newUserData);
    }
    return res.send(newUserData);
  } else if (socialDataResponse && socialDataResponse.isRegistered === true && socialDataResponse.isSocialRegistered === false) {
    var update = {};
    var socialLogins = [];
    socialLogins.push(obj);
    update.socialLogins = socialLogins;
    update.isSocialLogin = true;
    update.socialPhotoUrl = params.photoUrl;
    update.tsModifiedAt = Date.now();
    var updateUser = await User.updateOne(findCriteria, update)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while add social login data',
          error: err
        }
      })
    if (updateUser && (updateUser.success !== undefined) && (updateUser.success === 0)) {
      return updateUser;
    }
    newUserData = await setLoginResponse(findCriteria, socialDataResponse, isEmailUpdated)
    if (newUserData && (newUserData.success !== undefined) && (newUserData.success === 0)) {
      return res.send(newUserData);
    }
    return res.send(newUserData);
  } else if (socialDataResponse && socialDataResponse.isRegistered === true && socialDataResponse.isSocialRegistered === true) {
    var update = {};
    if (!socialDataResponse.isLogin) {
      update = {
        $push: {
          socialLogins: obj
        }

      }
    }
    update.socialPhotoUrl = params.photoUrl;
    update.tsModifiedAt = Date.now();
    var updateUser = await User.updateOne(findCriteria, update)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while add social login data',
          error: err
        }
      })
    if (updateUser && (updateUser.success !== undefined) && (updateUser.success === 0)) {
      return updateUser;
    }
    newUserData = await setLoginResponse(findCriteria, socialDataResponse, isEmailUpdated)
    if (newUserData && (newUserData.success !== undefined) && (newUserData.success === 0)) {
      return res.send(newUserData);
    }
    return res.send(newUserData);

  }
}

exports.updateForSocialAccount = async (req, res) => {
  var params = req.body;
  if (!params.dob || !params.language
    || !params.token || !params.school
    || !params.countryId || !params.stateId
    || !params.city) {
    if (!params.dob) {
      errors.push({
        field: "dob",
        message: "dob missing"
      });
    }
    if (!params.language) {
      errors.push({
        field: "language",
        message: "language missing"
      });
    }
    if (!params.school) {
      errors.push({
        field: "school",
        message: "school missing"
      });
    }
    if (!params.token) {
      errors.push({
        field: "token",
        message: "token missing"
      });
    }
    if (!params.countryId) {
      errors.push({
        field: "countryId",
        message: "countryId missing"
      });
    }
    if (!params.stateId) {
      errors.push({
        field: "stateId",
        message: "stateId missing"
      });
    }
    if (!params.city) {
      errors.push({
        field: "city",
        message: "city missing"
      });
    }
    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });

  }

  const userDetails = await checkAuthToken(params.token, JWT_KEY);

  if (userDetails && userDetails.success !== undefined && userDetails.success === 0) {
    return res.send(userDetails)
  }
  const data = userDetails.data;
  const userId = data.userId;
  var findCriteria = {
    _id: userId,
    status: 1
  }
  var projection = {
    coinCount: 1,
    email: 1,
    firstName: 1,
    lastName: 1,
    middlename: 1,
    image: 1,
    password: 1
  }
  var checkUser = await User.findOne(findCriteria, projection)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking user',
        error: err
      }
    })
  if (checkUser && (checkUser.success !== undefined) && (checkUser.success === 0)) {
    return checkUser;
  }
  // if (!checkUser) {
  //   return res.status(200).send({
  //     success: 0,
  //     message: 'User not found'
  //   })
  // }

  var emailCheck = await checkYourEmail(params);

  if (emailCheck && emailCheck.success !== undefined && emailCheck.success === 0) {
    return res.send(emailCheck)
  }
  var update = {};
  // var formattedDate = moment(params.dob, 'DD MMMM YYYY');
  if (params.email) {
    update.email = params.email;
  }
  update.dob = params.dob;
  update.countryId = params.countryId;
  update.stateId = params.stateId;
  update.city = params.city;
  update.school = params.school;
  update.language = params.language;
  update.tsModifiedAt = Date.now();
  console.log("update")
  console.log(update)
  console.log("update")
  var updateUser = await User.updateOne(findCriteria, update)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while update dob and language',
        error: err
      }
    })
  if (updateUser && (updateUser.success !== undefined) && (updateUser.success === 0)) {
    return updateUser;
  }
  checkUser = await User.findOne(findCriteria, projection)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting user',
        error: err
      }
    })
  if (checkUser && (checkUser.success !== undefined) && (checkUser.success === 0)) {
    return checkUser;
  }

  return res.send({
    success: 1,
    statusCode: 200,
    token: params.token,
    userDetails: checkUser,

    message: 'Language and dob updated successfully'
  })
}

exports.deleteAccount = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var findCriteria = {
    _id: userId,
    status: 1
  }

  var userData = await User.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking user data',
        error: err
      }
    })
  if (userData && (userData.success !== undefined) && (userData.success === 0)) {
    return res.send(userData);
  }
  if (userData) {
    var update = {};
    update.status = 0;
    update.tsModifiedAt = Date.now();

    var updateUser = await User.updateOne(findCriteria, update)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while delete account',
          error: err
        }
      })
    if (updateUser && (updateUser.success !== undefined) && (updateUser.success === 0)) {
      return res.send(updateUser);
    }
    //check if tutor change subject status
    var userResponseObj = {};
    userResponseObj.userId = userId;
    userResponseObj.status = 0;
    userResponseObj.isTutor = userData.isTutor ? userData.isTutor : false;

    var checkTutorAndUpdateResp = await checkTutorAndUpdate(userResponseObj);
    if (checkTutorAndUpdateResp && (checkTutorAndUpdateResp.success !== undefined) && (checkTutorAndUpdateResp.success === 0)) {
      return res.send(checkTutorAndUpdateResp);
    }

    let payload = { mongoId:userId};
    

    

    try {
        const res1 = await superagent.post('https://backend.pgsedu.com/alumnis/delete-user').send(payload);
        console.log('res');
      } catch (err) {
        console.error(err.message);
      }


    return res.send({
      status: 1,
      message: 'Your account deleted permanently'
    });


  } else {
    return res.send({
      success: 0,
      message: "Invalid user"
    })
  }
}

exports.updateAccountStatus = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var params = req.body;

  if (!params.status || (params.status !== constants.ACTIVATE_ACCOUNT_STATUS
    && params.status !== constants.DEACTIVATE_ACCOUNT_STATUS)) {
    var errors = [];
    if (!params.status) {
      errors.push({
        field: "status",
        message: "Required status"
      })
    }
    if ((params.status !== constants.ACTIVATE_ACCOUNT_STATUS
      && params.status !== constants.DEACTIVATE_ACCOUNT_STATUS)) {
      errors.push({
        field: "status",
        message: "invalid status"
      })
    }

    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }


  var findCriteria = {
    _id: userId,
    status: 1
  }

  var userData = await User.findOne(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking user data',
        error: err
      }
    })
  if (userData && (userData.success !== undefined) && (userData.success === 0)) {
    return res.send(userData);
  }
  if (userData) {

    var checkAccountStatusResp = await checkAccountStatus(userData, params.status);
    if (checkAccountStatusResp && (checkAccountStatusResp.success !== undefined) && (checkAccountStatusResp.success === 0)) {
      return res.send(checkAccountStatusResp);
    }

    var update = {};
    update.isDeactivated = checkAccountStatusResp.isDeactivated;
    update.tsModifiedAt = Date.now();

    var updateUser = await User.updateOne(findCriteria, update)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while ' + checkAccountStatusResp.message + ' account',
          error: err
        }
      })
    if (updateUser && (updateUser.success !== undefined) && (updateUser.success === 0)) {
      return res.send(updateUser);
    }

    //check if tutor change subject status
    checkAccountStatusResp.userId = userId;
    var checkTutorAndUpdateResp = await checkTutorAndUpdate(checkAccountStatusResp);
    if (checkTutorAndUpdateResp && (checkTutorAndUpdateResp.success !== undefined) && (checkTutorAndUpdateResp.success === 0)) {
      return res.send(checkTutorAndUpdateResp);
    }

    return res.send({
      status: 1,
      message: 'Your account ' + checkAccountStatusResp.message + ' successfully'
    });



  } else {
    return res.send({
      success: 0,
      message: "Invalid user"
    })
  }
}

exports.requestAsTutor = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var params = req.body;
  var file = req.file;

  if (params.tutorCourseIds === null || params.tutorCourseIds === undefined || (params.tutorCourseIds !== undefined && params.tutorCourseIds.length < 1)


    || params.tutorCategoryIds === null || params.tutorCategoryIds === undefined || (params.tutorCategoryIds !== undefined && params.tutorCategoryIds.length < 1)
    || !params.courceDescription
    // || !file 
    //|| !params.location
    // ||  (params.yearOfExperience === null || params.yearOfExperience === undefined)
    //  ||  !params.achievementsOrAwards || !params.achievementsOrAwards
    //  ||  !params.institution || !params.institution
  ) {
    // || !params.lat || !params.lng) {
    var errors = [];
    if (params.tutorCourseIds === null || params.tutorCourseIds === undefined || (params.tutorCourseIds !== undefined && params.tutorCourseIds.length < 1)) {
      errors.push({
        'field': 'tutorCourseIds',
        'message': 'tutorCourseId required',
      })
    }
    // if (params.tutorSubjectIds === null || params.tutorSubjectIds === undefined || (params.tutorSubjectIds !== undefined && params.tutorSubjectIds.length < 1)) {
    //   errors.push({
    //     'field': 'tutorSubjectIds',
    //     'message': 'tutorSubjectIds required',
    //   })
    // }
    // if (params.tutorClassIds === null || params.tutorClassIds === undefined || (params.tutorClassIds !== undefined && params.tutorClassIds.length < 1)) {
    //   errors.push({
    //     'field': 'tutorClassIds',
    //     'message': 'tutorClassIds required',
    //   })
    // }
    if (params.tutorCategoryIds === null || params.tutorCategoryIds === undefined || (params.tutorCategoryIds !== undefined && params.tutorCategoryIds.length < 1)) {
      errors.push({
        'field': 'tutorCategoryIds',
        'message': 'tutorCategoryIds required',
      })
    }
    if (!params.courceDescription) {
      errors.push({
        'field': 'courceDescription',
        'message': 'courceDescription required',
      })
    }

    if (!params.location) {
      errors.push({
        'field': 'location',
        'message': 'location required',
      })
    }
    // if ((params.yearOfExperience === null || params.yearOfExperience === undefined)) {
    //   errors.push({
    //     'field': 'yearOfExperience',
    //     'message': 'yearOfExperience required',
    //   })
    // }
    // if (!params.achievementsOrAwards) {
    //   errors.push({
    //     'field': 'achievementsOrAwards',
    //     'message': 'achievementsOrAwards required',
    //   })
    // }
    // if (!params.institution) {
    //   errors.push({
    //     'field': 'institution',
    //     'message': 'institution required',
    //   })
    // }
    // if (!file) {
    //   errors.push({
    //     'field': 'video',
    //     'message': 'sample video required',
    //   })
    // }

    return res.send({
      success: 0,
      errors
    })

  }



  var checkUserData = await User.findOne({
    _id: userId,
    isTutor: true,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking user data',
        error: err
      }
    })
  if (checkUserData && (checkUserData.success !== undefined) && (checkUserData.success === 0)) {
    return res.send(checkUserData);
  }
  if (checkUserData) {
    return res.send({
      success: 0,
      message: "You are already a tuttor"
    })
  }
  var checkRequestAlready = await TutorRequest.findOne({
    userId,
    isRejected: false,
    isApproved: false,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking tutor request already',
        error: err
      }
    })
  if (checkRequestAlready && (checkRequestAlready.success !== undefined) && (checkRequestAlready.success === 0)) {
    return res.send(checkRequestAlready);
  }
  if (checkRequestAlready) {
    return res.send({
      success: 0,
      message: "Sent tutor request already"
    })
  }

  var newTutorRequestObj = {};
  newTutorRequestObj.userId = userId;
  newTutorRequestObj.tutorCourseIds = params.tutorCourseIds;
  newTutorRequestObj.tutorCategoryIds = params.tutorCategoryIds;
  newTutorRequestObj.tutorSubjectIds = params.tutorSubjectIds;
  newTutorRequestObj.tutorClassIds = params.tutorClassIds;
  newTutorRequestObj.courceDescription = params.courceDescription;
  if (params.institution) {
    newTutorRequestObj.institution = params.institution;
  }
  if (params.achievementsOrAwards) {
    newTutorRequestObj.achievementsOrAwards = params.achievementsOrAwards;
  }
  if (params.yearOfExperience !== null && params.yearOfExperience !== undefined) {
    newTutorRequestObj.yearOfExperience = params.yearOfExperience;
  }
  if (params.lat) {
    newTutorRequestObj.lat = params.lat;
  } else {
    newTutorRequestObj.lat = null;
  }

  if (params.lng) {
    newTutorRequestObj.lng = params.lng;
  } else {
    newTutorRequestObj.lng = null;

  }

  console.log("params => ", params)

  newTutorRequestObj.location = params.location;
  newTutorRequestObj.sampleVideo = (file && file.filename) ? file.filename : null;
  newTutorRequestObj.isApproved = false;
  newTutorRequestObj.isRejected = false;
  newTutorRequestObj.status = 1;
  newTutorRequestObj.tsCreatedAt = Date.now();
  newTutorRequestObj.tsModifiedAt = null;

  var newTutorRequest = new TutorRequest(newTutorRequestObj);
  var newTutorRequestData = await newTutorRequest.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving tutor request',
        error: err.message
      }
    })
  if (newTutorRequestData && (newTutorRequestData.success !== undefined) && (newTutorRequestData.success === 0)) {
    console.log("09/04", newTutorRequestData);
    return res.send(newTutorRequestData);
  }

  return res.send({
    success: 1,
    statusCode: 200,
    message: 'Sent your request to become tutor',
  })
}

// notification for php 

exports.approvalAlert = async (req,res) => {

  if (!req.body){
    return res.send({
      success:0,
      message:"body not found"
    })
  }
  if (!req.body.userId){
    return res.send({
      success:0,
      message:"user not found"
    })
  }
  if (!req.body.message){
    return res.send({
      success:0,
      message:"message not found"
    })
  }
  if (!req.body.title){
    return res.send({
      success:0,
      message:"title not found"
    })
  }


  var owners = req.body.userId;


  if(owners.length == 0){
    return res.send({
      success:0,
      message:"user not found"
    })
  }

  for (x in owners){
      var owner = owners[x];
      var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

      var notificationObj = {
          title: req.body.title,
          message: req.body.message,
          type: constants.ALUMNI_JOIN_REQUEST_NOTIFICATION_TYPE,
          filtersJsonArr,
          // metaInfo,
         // typeId: params.groupId,
          userId: owner,
          notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
      }
      let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
  }

    

    return res.send({
      success:1,
      message : "notifications send"
    })
}

//end

exports.getTutorProfile = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }


  var myClassData = await OnlineClass.find({
    userId,
    isApproved: true,
    isRejected: false,
    status: 1
  })
    .populate([{
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])

    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get my classes',
        error: err
      }
    })
  if (myClassData && (myClassData.success !== undefined) && (myClassData.success === 0)) {
    return res.send(myClassData);
  }
  var pageParams1 = {
    skip: 0,
    limit: 2
  }
  var appointmentData = await classRequest.find({ status: 1, tutorId: userId }, { tutorId: 0 }, pageParams1).populate([{ path: 'userId', select: { 'image': 1, 'firstName': 1 } }, { path: 'classId', select: { 'title': 1 } }]).sort({ 'tsCreatedAt': -1 }).catch(err => {
    return {
      success: 0,
      message: "something went wrong",
      error: err.message
    }
  })
  if (appointmentData && (appointmentData.success !== undefined) && (appointmentData.success === 0)) {
    return res.send(appointmentData);
  }
  if (!appointmentData || appointmentData === null) {
    appointmentData = [];
  }

  // null user verification 

  var appointmentsList = [];
  for (each in appointmentData) {
    let x = appointmentData[each];
    if (x.userId == null) {
      appointmentsList.push({
        tutorId: x.tutorId,
        tutorSubjectId: x.tutorSubjectId,
        tutorClassId: x.tutorClassId,
        isApproved: x.isApproved,
        isRejected: x.isRejected,
        isStudentDeleted: x.isStudentDeleted,
        isTutorDeleted: x.isTutorDeleted,
        id: x.id
      })
    }
    else {
      appointmentsList.push(x);
    }

  }



  tutorCheck.myAppointments = appointmentsList
  tutorCheck.myClasses = myClassData;
  tutorCheck.classImageBase = classConfig.imageBase;
  tutorCheck.imageBase = usersConfig.imageBase;

  return res.send(tutorCheck);
}

exports.updateTutorProfile = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  console.log("13/04")
  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var params = req.body;
  var file = req.file;

  if ((params.tutorCourseIds === null || params.tutorCourseIds === undefined || (params.tutorCourseIds !== undefined && params.tutorCourseIds.length < 1))
    && (params.tutorSubjectIds === null || params.tutorSubjectIds === undefined || (params.tutorSubjectIds !== undefined && params.tutorSubjectIds.length < 1))
    && (params.tutorClassIds === null || params.tutorClassIds === undefined || (params.tutorClassIds !== undefined && params.tutorClassIds.length < 1))
    && (params.tutorCategoryIds === null || params.tutorCategoryIds === undefined || (params.tutorCategoryIds !== undefined && params.tutorCategoryIds.length < 1))
    && !params.courceDescription
    && !file
    && (params.yearOfExperience === null || params.yearOfExperience === undefined)
    && !params.achievementsOrAwards
    && !params.institution
    && !params.location && !params.lat && !params.lng) {
    return res.send({
      success: 0,
      message: "Nothing to update"
    })
  }
  var tutorProfileUpdateObj = {};
  tutorProfileUpdateObj.userId = userId;
  if ((params.tutorCourseIds !== null && params.tutorCourseIds !== undefined && (params.tutorCourseIds !== undefined && params.tutorCourseIds.length >= 1))) {
    tutorProfileUpdateObj.tutorCourseIds = params.tutorCourseIds;
  }
  if ((params.tutorSubjectIds !== null && params.tutorSubjectIds !== undefined && (params.tutorSubjectIds !== undefined && params.tutorSubjectIds.length >= 1))) {
    tutorProfileUpdateObj.tutorSubjectIds = params.tutorSubjectIds;
  }
  if ((params.tutorClassIds !== null && params.tutorClassIds !== undefined && (params.tutorClassIds !== undefined && params.tutorClassIds.length >= 1))) {
    tutorProfileUpdateObj.tutorClassIds = params.tutorClassIds;
  }
  if ((params.tutorCategoryIds !== null && params.tutorCategoryIds !== undefined && (params.tutorCategoryIds !== undefined && params.tutorCategoryIds.length >= 1))) {
    tutorProfileUpdateObj.tutorCategoryIds = params.tutorCategoryIds;
  }
  if (params.courceDescription) {
    tutorProfileUpdateObj.courceDescription = params.courceDescription;
  }

  if (params.location) {
    tutorProfileUpdateObj.location = params.location;
  }
  if (params.lat) {
    tutorProfileUpdateObj.lat = params.lat;
  }
  if (params.lng) {
    tutorProfileUpdateObj.lng = params.lng;
  }
  if (params.institution) {
    tutorProfileUpdateObj.institution = params.institution;
  }
  if (params.achievementsOrAwards) {
    tutorProfileUpdateObj.achievementsOrAwards = params.achievementsOrAwards;
  }
  if (params.yearOfExperience !== null && params.yearOfExperience !== undefined) {
    tutorProfileUpdateObj.yearOfExperience = params.yearOfExperience;
  }
  tutorProfileUpdateObj.isApproved = false;
  tutorProfileUpdateObj.isRejected = false;
  tutorProfileUpdateObj.status = 1;
  tutorProfileUpdateObj.tsCreatedAt = Date.now();
  tutorProfileUpdateObj.tsModifiedAt = null;

  console.log("31/03", tutorProfileUpdateObj);
  console.log("07/04", req.body);
  var newTutorProfileUpdateObj = new TutorProfileUpdateRequest(tutorProfileUpdateObj);
  var newTutorProfileUpdateResponse = await newTutorProfileUpdateObj.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving tutor profile update request',
        error: err
      }
    })
  if (newTutorProfileUpdateResponse && (newTutorProfileUpdateResponse.success !== undefined) && (newTutorProfileUpdateResponse.success === 0)) {
    return newTutorProfileUpdateResponse;
  }
  return res.send({
    success: 1,
    statusCode: 200,
    message: 'Sent your request to update your tutor profile',
  })

}

// exports.updateAppointmentStatus = async(req,res) =>{
//   var userData = req.identity.data;
//   var userId = userData.userId;
//   var tutorCheck = await checkUserIsTutor(userId);
//   if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
//     return res.send(tutorCheck);
//   }
//   var params = req.body;
//   var appointmentId = req.params.id;

//   if(!params.status || (params.status && params.status !== constants.APPROVED_STATUS
//      && params.status !== constants.REJECTED_STATUS)){
//     var errors = [];
//     if (!params.status) {
//       errors.push({
//         'field': 'status',
//         'message': 'appoinment status required',
//       })
//     }
//     if ((params.status && params.status !== constants.APPROVED_STATUS
//       && params.status !== constants.REJECTED_STATUS)) {
//       errors.push({
//         'field': 'status',
//         'message': 'Invalid status',
//       })
//     }
//     return res.send({
//       success: 0,
//       errors
//     })
//   }
//   var isApproved = false;
//   var isRejected = false;
//   var message = ""
//   if(params.status === constants.APPROVED_STATUS){
//     isApproved = true;
//     message = 'Appointment accepted successfully'
//   }else{
//     message = 'Appointment rejected successfully'
//     isRejected = false;
//   }

//   var checkAppointment = await AppointmentClassRequest.findOne({
//     _id : appointmentId,
//     tutorId : userId,
//      status : 1
//   })
//   .catch(err => {
//     return {
//       success: 0,
//       message: 'Something went wrong while check user',
//       error: err
//     }
//   })
// if (checkAppointment && (checkAppointment.success !== undefined) && (checkAppointment.success === 0)) {
//   return res.send(checkAppointment);
// }
// if(checkAppointment){
//    var checkAppointmentResp = await checkAppointmentStatusCheck(checkAppointment,isApproved,isRejected)
//    if (checkAppointmentResp && (checkAppointmentResp.success !== undefined) && (checkAppointmentResp.success === 0)) {
//     return res.send(checkAppointmentResp);
//   }

//   var updateAppointmentStatus = await AppointmentClassRequest.updateOne({
//     _id : appointmentId,
//     tutorId : userId,
//     status : 1
//   },checkAppointmentResp.update)
//   .catch(err => {
//     return {
//       success: 0,
//       message: 'Something went wrong while check user',
//       error: err
//     }
//   })
// if (updateAppointmentStatus && (updateAppointmentStatus.success !== undefined) && (updateAppointmentStatus.success === 0)) {
//   return res.send(updateAppointmentStatus);
// }
// return res.send({
//   success : 1,
//   message
// })
// }else{
//   return {
//     success: 0,
//     message: 'Appoinment request not exists',
//   };
// }

// }


async function checkUser(params, condition) {
  var isDobLanguageUpdated = false;
  var userCheck = await User.findOne(condition)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while check user',
        error: err
      }
    })
  if (userCheck && (userCheck.success !== undefined) && (userCheck.success === 0)) {
    return userCheck;
  }

  if (userCheck) {

    if (userCheck.dob !== undefined && userCheck.dob !== null &&
      userCheck.language !== undefined && userCheck.language !== null) {
      isDobLanguageUpdated = true;
    }
    if (userCheck.isSocialLogin !== undefined && userCheck.isSocialLogin) {
      var socialLogins = userCheck.socialLogins;

      let socialLoginIndex = await socialLogins.findIndex(x => (x.provider === params.provider && x.status === 1));
      if (socialLoginIndex <= -1) {
        return {
          success: 1,
          message: params.provider + ' not added',
          isRegistered: true,
          isSocialRegistered: true,
          isLogin: false,
          isDobLanguageUpdated,
          userCheck
        }
      } else {
        return {
          success: 1,
          message: 'Login',
          isRegistered: true,
          isSocialRegistered: true,
          isLogin: true,
          isDobLanguageUpdated,
          userCheck
        }
      }
    } else {
      return {
        success: 1,
        message: params.provider + ' not added',
        isRegistered: true,
        isSocialRegistered: false,
        isLogin: false,
        isDobLanguageUpdated,
        userCheck
      }
    }
  } else {
    return {
      success: 1,
      message: 'Not registered',
      isRegistered: false,
      isSocialRegistered: false,
      isLogin: false,
      isDobLanguageUpdated,
    }
  }
}

async function setLoginResponse(findCriteria, socialDataResponse, isEmailUpdated) {

  var newUserData = await User.findOne(findCriteria, {
    coinCount: 1,
    email: 1,
    firstName: 1,
    lastName: 1,
    middlename: 1,
    image: 1,
    isSocialLogin: 1,
    socialPhotoUrl: 1,
    password: 1,
    socialSignUpCompleted:1,
    isTutor: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting user data',
        error: err
      }
    })
  if (newUserData && (newUserData.success !== undefined) && (newUserData.success === 0)) {
    return (newUserData);
  }
  var payload = {
    userId: newUserData.id
  };
  var token = jwt.sign({
    data: payload,
  }, JWT_KEY, {
    expiresIn: '30 days'
  });
  if (newUserData.email && newUserData.email !== null) {
    isEmailUpdated = true
  }
  return {
    success: 1,
    statusCode: 200,
    userDetails: newUserData,
    isDobLanguageUpdated: socialDataResponse.isDobLanguageUpdated,
    isEmailUpdated,
    token,
    message: 'Successfully logged in'
  }
}

async function checkAuthToken(token, JWT_KEY) {
  try {
    const userDetails = jwt.verify(token, JWT_KEY);
    const data = userDetails.data;
    return {
      success: 1,
      data,
      message: 'User details',
    };
  } catch (error) {
    return {
      success: 0,
      message: 'Invalid token',
      error: "Not authorized to access this resource"
    };
  }
}



async function sendMail(message, target, title) {

  var ret = 0;

  const msg = {
    to: target,
    from: config.resetpassword.fromMail,
    subject: title,
    text: message,
  };
  console.log(target, message, "sender", config.resetpassword.fromMail);
  sgMail
    .send(msg)
    .then(() => console.log('send mail success'))
    .catch(err => {
      console.log(JSON.stringify(err));
      ret = 1;
      return ret;
    });
  return ret;
}

async function validateSocialSignupRequest(params) {
  var errors = [];
  console.log("params")
  console.log(params)
  console.log("params")
  if ((!params.email && params.provider === constants.GOOGLE_PROVIDER) ||
    // (!params.email && !params.phone && params.provider === constants.FACEBOOK_PROVIDER) ||
    !params.firstName ||
    !params.provider ||
    (params.provider && params.provider !== constants.FACEBOOK_PROVIDER && params.provider !== constants.GOOGLE_PROVIDER) ||
    !params.id 
    // !params.photoUrl
    // || !params.dob
    // || !params.language
  ) {
    if (!params.email && params.provider === constants.GOOGLE_PROVIDER) {
      errors.push({
        field: "email",
        message: "email missing"
      });
    }
    // if (!params.email && !params.phone && params.provider === constants.FACEBOOK_PROVIDER) {
    //   errors.push({
    //     field: "email or phone",
    //     message: "please provide email or phone"
    //   });
    // }
    if (!params.firstName) {
      errors.push({
        field: "firstName",
        message: "name missing"
      });
    }
    if (!params.provider) {
      errors.push({
        field: "provider",
        message: "provider missing"
      });
    }
    if ((params.provider && params.provider !== constants.FACEBOOK_PROVIDER && params.provider !== constants.GOOGLE_PROVIDER)) {
      errors.push({
        field: "provider",
        message: "Invalid provider"
      });
    }
    // start : modified by Manesh request
    // if (!params.photoUrl) {
    //   errors.push({
    //     field: "photoUrl",
    //     message: "photoUrl missing"
    //   });
    // }
    // end
    // if (!params.dob) {
    //   errors.push({
    //     field: "dob",
    //     message: "dob missing"
    //   });
    // }
    if (!params.id) {
      errors.push({
        field: "id",
        message: "id missing"
      });
    }
    // if (!params.language) {
    //   errors.push({
    //     field: "language",
    //     message: "language missing"
    //   });
    // }
    return {
      success: 0,
      errors: errors,
      code: 200
    };
  }
  var didNormalLogin = await User.countDocuments({status:1,email:params.email,isSocialLogin:false}).catch(err=>{
    return {succes: 0, message: err.message }
  })

  if(didNormalLogin && didNormalLogin.succes != undefined && didNormalLogin.succes === 0){
    return didNormalLogin
  }

  if(didNormalLogin > 0){
    return {success: 0,message:"user already registered with password"}
  }

  var isProvideAnyUnique = false;
  if ((!params.email || params.email === null) && (params.provider === constants.FACEBOOK_PROVIDER)) {
    isProvideAnyUnique = true;
  }
  return {
    success: 1,
    isProvideAnyUnique
  }
}


async function checkYourEmail(params) {
  if (params.email) {
    console.log("1")
    var checkEmail = await User.findOne({
      email: params.email,
      status: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while check email already exists',
          error: err
        }
      })
    if (checkEmail && (checkEmail.success !== undefined) && (checkEmail.success === 0)) {
      return (checkEmail);
    }
    console.log("2 checkEmail")
    console.log(checkEmail)
    console.log("checkEmail")
    if (checkEmail) {
      console.log("3")
      console.log("email already exists")
      return {
        success: 0,
        message: "Email already exists"
      }
    } else {
      console.log("4")

      return {
        success: 1,
        message: "Unique email"
      }
    }

  } else {
    console.log("5")

    return {
      success: 1,
      message: "Email updated initially"
    }
  }
}

async function checkPassword(params, userId) {
  if (params.password || params.oldPassword) {
    var userData = await User.findOne({
      _id: userId,
      status: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting user data',
          error: err
        }
      })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
      return userData;
    }
    console.log("1")
    if (userData.password && userData.password !== null) {
      console.log("2")

      console.log("reset password")
      if (!params.oldPassword) {
        console.log("3")

        return {
          success: 0,
          message: "Old password missing",
        }
      } else if (!params.password) {
        console.log("4")

        return {
          success: 0,
          message: "New password missing",
        }
      } else {
        console.log("5")

        let matched = await bcrypt.compare(params.oldPassword, userData.password);
        if (matched) {
          console.log("6")

          const hash = bcrypt.hashSync(params.password, salt);
          return {
            success: 1,
            isPasswordUpdate: true,
            password: hash,
            message: "New password",
          }
        } else {
          console.log("7")

          return {
            success: 0,
            message: "Old password incorrect",
          }
        }
      }

    } else {
      console.log("8")

      const hash = await bcrypt.hashSync(params.password, salt);
      return {
        success: 1,
        isPasswordUpdate: true,
        password: hash,
        message: "New password ",
      }
    }

  } else {
    console.log("9")

    return {
      success: 1,
      isPasswordUpdate: false,
      message: 'Password not in request'
    }
  }
}

async function checkUserIsTutor(userId) {
  var project = {
    firstName: 1,
    image: 1,
    socialPhotoUrl: 1,
    tutorCourseIds: 1,
    tutorSubjectIds: 1,
    tutorClassIds: 1,
    tutorCategoryIds: 1,
    courceDescription: 1,
    isPaid: 1,
    fee: 1,
    institution: 1,
    achievementsOrAwards: 1,
    yearOfExperience: 1,
    sampleVideo: 1,
    lat: 1,
    lng: 1,
    location: 1,
    isTutor: 1
  }
  var userData = await User.findOne({
    _id: userId,
    status: 1
  }, project)
    // .populate([{
    //   path: 'tutorCourseIds',
    // }, {
    //   path: 'tutorSubjectIds',
    // }, {
    //   path: 'tutorClassIds',
    // }, {
    //   path: 'tutorCategoryIds',
    // }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking user is a tutor',
        error: err
      }
    })
  if (userData && (userData.success !== undefined) && (userData.success === 0)) {
    return userData;
  }
  if (userData) {

    if (userData.isTutor) {
      return {
        success: 1,
        message: 'Tutor details',
        item: userData,
        videoBase: tutorsConfig.videoBase
      }
    } else {
      return {
        success: 0,
        message: 'You are not a tutor',
      }
    }
  } else {
    return {
      success: 0,
      message: 'User not exists',
    }
  }
}

async function checkAccountStatus(userData, changeStatus) {
  var isDeactivated = false;
  var status = 1;
  var message = ''
  console.log("status : " + status)
  console.log("userData")
  console.log(userData)
  console.log("userData")
  if (changeStatus === constants.ACTIVATE_ACCOUNT_STATUS) {
    isDeactivated = false;
    status = 1;
    message = 'activate'
  }
  if (changeStatus === constants.DEACTIVATE_ACCOUNT_STATUS) {
    isDeactivated = true;
    status = 0;
    message = 'deactivate'
  }
  if (userData.isDeactivated === undefined || userData.isDeactivated === null) {
    return {
      success: 1,
      isDeactivated,
      status,
      isTutor: userData.isTutor,
      message
    }
  } else {
    if (userData.isDeactivated === true && isDeactivated === true) {
      return {
        success: 0,
        message: 'Account already deactivated',
      }
    }
    if (userData.isDeactivated === false && isDeactivated === false) {
      return {
        success: 0,
        message: 'Account already activated',
      }
    }
    return {
      success: 1,
      isDeactivated,
      status,
      isTutor: userData.isTutor,
      message
    }
  }
}


async function checkTutorAndUpdate(userObj) {
  var findCriteria = {
    userId: userObj.userId
  }
  var update = {
    status: userObj.status,
    tsModifiedAt: Date.now()
  }
  if (!userObj.isTutor) {
    var updateAppointmentRequestFromResp = await updateAppointmentRequestFromAndTo(findCriteria, update)
    if (updateAppointmentRequestFromResp && (updateAppointmentRequestFromResp.success !== undefined) && (updateAppointmentRequestFromResp.success === 0)) {
      return updateAppointmentRequestFromResp;
    }
    return userObj;
  } else {

    var updateOnlineClassResp = await updateTutorOnlineClassStatus(findCriteria, update)
    if (updateOnlineClassResp && (updateOnlineClassResp.success !== undefined) && (updateOnlineClassResp.success === 0)) {
      return updateOnlineClassResp;
    }

    var updateAppointmentRequestFromResp = await updateAppointmentRequestFromAndTo(findCriteria, update)
    if (updateAppointmentRequestFromResp && (updateAppointmentRequestFromResp.success !== undefined) && (updateAppointmentRequestFromResp.success === 0)) {
      return updateAppointmentRequestFromResp;
    }
    findCriteria = {
      tutorId: userObj.userId
    }
    var updateAppointmentRequestToResp = await updateAppointmentRequestFromAndTo(findCriteria, update)

    if (updateAppointmentRequestToResp && (updateAppointmentRequestToResp.success !== undefined) && (updateAppointmentRequestToResp.success === 0)) {
      return updateAppointmentRequestToResp;
    }
    return updateOnlineClassResp;

  }
}

async function updateTutorOnlineClassStatus(findCriteria, update) {
  var updateAllOnlineClass = await OnlineClass.update(findCriteria, update, { "multi": true })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while update online class',
        error: err
      }
    })
  if (updateAllOnlineClass && (updateAllOnlineClass.success !== undefined) && (updateAllOnlineClass.success === 0)) {
    return updateAllOnlineClass;
  }
  return {
    success: 1,
    message: 'Updated online class'
  }
}

async function updateAppointmentRequestFromAndTo(findCriteria, update) {
  var updateAppointment = await AppointmentClassRequest.update(findCriteria, update, { "multi": true })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while update online class',
        error: err
      }
    })
  if (updateAppointment && (updateAppointment.success !== undefined) && (updateAppointment.success === 0)) {
    return updateAppointment;
  }
  return {
    success: 1,
    message: 'Updated appointment requests'
  }

}

// async function checkAppointmentStatusCheck(appointmentData,isApproved,isRejected){
//   if(appointmentData.isApproved && isApproved){
//     return {
//       success: 0,
//       message: 'Appoinment request already approved',
//     };
//   }else if(appointmentData.isRejected && isRejected){
//     return {
//       success: 0,
//       message: 'Appoinment request already rejected',
//     };
//   }
//   var updateObj = {};
//   if(isApproved){
//     var findCriteria = {};
//     findCriteria.tutorSubjectId = appointmentData.tutorSubjectId;
//     findCriteria.tutorClassId = appointmentData.tutorClassId;
//     findCriteria.isPublic = false;
//     findCriteria.isApproved = true;
//     findCriteria.isRejected = false;
//     findCriteria.status = 1;

//     var checkOnlineClass = await OnlineClass.findOne(findCriteria)
//     .catch(err => {
//       return {
//         success: 0,
//         message: 'Something went wrong while checking user is a tutor',
//         error: err
//       }
//     })
//     if (checkOnlineClass && (checkOnlineClass.success !== undefined) && (userData.success === 0)) {
//     return checkOnlineClass;
//     }
//     if(!checkOnlineClass || checkOnlineClass === null){
//       return {
//         success: 0,
//         message: 'Requested online class not added, So add class',
//       };
//     }else{
//       updateObj.isApproved = true;
//     updateObj.tsModifiedAt = Date.now();

//     return {
//       success : 1,
//       message : 'Approve status',
//       update : updateObj
//     }
//     }
//   }else{
//     updateObj.isRejected = true;
//     updateObj.tsModifiedAt = Date.now();
//     return {
//       success : 1,
//       message : 'Reject status',
//       update : updateObj
//     }
//   }
// }


async function getLoginResponse(email) {
  let checkUser = await User.findOne({
    email: email,
    status: 1
  }, {
    coinCount: 1,
    email: 1,
    firstName: 1,
    lastName: 1,
    middlename: 1,
    image: 1,
    password: 1,
    isTutor: 1,
    dob: 1
  });
  if (!checkUser) {
    return {
      success: 0,
      message: 'User not found'
    }
  } else {
    var payload = {
      userId: checkUser.id
    };
    var token = jwt.sign({
      data: payload,
    }, JWT_KEY, {
      expiresIn: '30 days'
    });

    return {
      success: 1,
      statusCode: 200,
      userDetails: checkUser,
      token,
      flag: "ok",
      // message: 'Successfully logged in',
      message: "User Created Successfully."
    }
  }
}

async function getDayMonthAndYear(dob) {
  console.log("dob : " + dob)
  var dobDate = new Date(dob);
  console.log("dobDate : " + dobDate)
  var yearInDob = dobDate.getFullYear()
  console.log("yearInDob : " + yearInDob)
  var monthInDob = dobDate.getMonth()
  console.log("monthInDob : " + monthInDob)
  var dayInDob = dobDate.getDate()
  console.log("dayInDob : " + dayInDob)

  var dobObj = {};
  dobObj.dayInDob = dayInDob;
  dobObj.monthInDob = monthInDob + 1;
  dobObj.yearInDob = yearInDob;
  console.log("dobObj");
  console.log(dayInDob)
  console.log("dobObj");
  return dobObj;


}



async function send_otp(phone) {
  var otp = Math.floor(1000 + Math.random() * 9000);
  const apiToken = uuidv4();
  var expiry = Date.now() + (otpConfig.expirySeconds * 1000);
  try {
    const smsurl = await superagent.get(`http://thesmsbuddy.com/api/v1/sms/send?key=zOxsbDOn4iK8MBfNTyqxTlrcqM8WD3Ms&type=1&to=${phone}&sender=INFSMS&message=${otp} is the OTP for login to The PG  App&flash=0`);
    const newOtp = new Otp({
      phone: phone,
      isUsed: false,
      userToken: otp,
      apiToken: apiToken,
      expiry: expiry,
      status: 1,
      tsCreatedAt: new Date(),
      tsModifiedAt: null
    });
    var saveOtp = await newOtp.save();
    var otpResponse = {
      phone: saveOtp.phone,
      otp: otp,
      apiToken: saveOtp.apiToken,
    };
    return otpResponse
  } catch (error) {
    console.log(error.response.body);
  }

}

async function send_otp_bymail_1(email, phone) {

  var otp = Math.floor(1000 + Math.random() * 9000);
  const apiToken = uuidv4();
  var expiry = Date.now() + (otpConfig.expirySeconds * 1000);



  var settingData = await Setting.findOne({
    key: constants.SEND_GRID_AUTH_KEY,
    status: 1
  }).catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while getting sendgrid data',
      error: err
    }
  })
  if (settingData && (settingData.success !== undefined) && (settingData.success === 0)) {
    return { success: 0 };
  }
  if (settingData) {


    const mailmsg = "Your otp for verifying account is " + "   " + otp + " " + "greets from PGS APP";
    sgMail.setApiKey(settingData.value);

    console.log("email ->", mailmsg);
    const x = await sendMail(mailmsg, email, "OTP from PGS App");

    if (x && (x == 1)) {
      return {
        success: 0,
        message: "Mail could not be sent"
      }
    }

    const newOtp = new Otp({
      phone: phone,
      isUsed: false,
      userToken: otp,
      apiToken: apiToken,
      expiry: expiry,
      status: 1,
      tsCreatedAt: new Date(),
      tsModifiedAt: null
    });
    var saveOtp = await newOtp.save();
    var otpResponse = {
      phone: saveOtp.phone,
      otp: otp,
      apiToken: saveOtp.apiToken,
    };
    return otpResponse

  }

}

async function send_otp_bymail(email, phone) {


  var otp = Math.floor(1000 + Math.random() * 9000);
  const apiToken = uuidv4();
  var expiry = Date.now() + (otpConfig.expirySeconds * 1000);


  try {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pgsapp123@gmail.com',
        pass: 'Pgs@123!'
      }
    });

    var message = "Your otp for verification is " + otp.toString() + " greetings from PGS APP team"

    var mailOptions = {
      from: 'pgsapp123@gmail.com',
      to: email,
      subject: 'OTP',
      text: message
    };

    console.log(email, otp);

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    const newOtp = new Otp({
      phone: phone,
      isUsed: false,
      userToken: otp,
      apiToken: apiToken,
      expiry: expiry,
      status: 1,
      tsCreatedAt: new Date(),
      tsModifiedAt: null
    });
    var saveOtp = await newOtp.save();
    var otpResponse = {
      phone: saveOtp.phone,
      otp: otp,
      apiToken: saveOtp.apiToken,
    };
    return otpResponse
  } catch (error) {
    console.log(error.message);
  }






  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

exports.removeTeacher = async (req, res) => {


  var update = await User.updateMany({ isTutor: true }, { isTutor: false });
  var cnt = await User.countDocuments({ isTutor: false });

  return res.send({ number: cnt })

}

exports.removeTutorRequest = async (req, res) => {


  var update = await TutorRequest.updateMany({}, { status: 0 });
  var cnt = await TutorRequest.countDocuments({ status: 0 });

  return res.send({ number: cnt })

}

exports.isTutorCheck = async (req, res) => {

  var userData = req.identity.data;
  var userId = userData.userId;

  var data = await User.findOne({ _id: userId }, { isTutor: 1 }).catch(err => {
    return { succes: 0, message: err.message };
  })

  if (data && data.success != undefined && data.success === 0) {
    return res.send(data);
  }

  if (data.isTutor == true) {
    return res.send({
      success: 1,
      message: "success",
      isTutor: true
    })
  }
  else {
    return res.send({
      success: 1,
      message: "success",
      isTutor: false
    })
  }
}

exports.removeUser = async (req, res) => {


  
  let email = req.params.id;

  var userData = await User.findOne({ email: email, status: 1 }).catch(err => {
    return { success: 0,err: err.message}
  })

  if(userData && userData.success!== undefined && userData.success === 0){
    return res.send(userData);
  }

  if (!userData){
    return res.send({
      success:0,
      message:"user not exists"
    })
  }


  var update = await User.updateOne({ email: email, status: 1 }, { status: 0 }).catch(err => {
    return { success: 0,err: err.message}
  })

  if(update && update.success!== undefined && update.success === 0){
    return res.send(update);
  };
 const userId = userData._id

  try {
    const res1 = await superagent.post('https://backend.pgsedu.com/alumnis/delete-user').send({mongoId:userId});
    
  } catch (err) {
    return res.send({
      success:0,err: err.message
    })
  }

  return res.send({
    success:1,
    update:update
  })
}
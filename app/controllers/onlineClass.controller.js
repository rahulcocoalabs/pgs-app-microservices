const Otp = require('../models/otp.model.js');
const Setting = require('../models/setting.model');
const otplib = require('otplib');
const uuidv4 = require('uuid/v4');
var config = require('../../config/app.config.js');
var smsConfig = config.sms;
const JWT_KEY = config.jwt.key;
const JWT_EXPIRY_SECONDS = config.jwt.expirySeconds;

var msg91 = require("msg91")(smsConfig.key, smsConfig.fromNo, smsConfig.route);

var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var crypto = require("crypto");

const User = require('../models/user.model');
const OnlineCLass = require('../models/onlineClass.model');
const tutorRequestModel = require('../models/requestForTutor.model');
const TutorCategory = require('../models/tutorCategory.model');
const TutorCourse = require('../models/tutorCourse.model');
const TutorClass = require('../models/tutorClass.model');
const TutorSubject = require('../models/tutorSubject.model');
const AppointmentClassRequest = require('../models/appointmentClassRequest.model');
const Currency = require('../models/currency.model');
const TutorSyllabus = require('../models/tutorSyllabus.model');
var gateway = require('../components/gateway.component.js');

var moment = require('moment');
ObjectId = require('mongodb').ObjectID;
var charitiesConfig = config.charities;
var utilities = require('../components/utilities.component.js');
const constants = require('../helpers/constants');
const Feed = require('../models/feed.model.js');
const sgMail = require('@sendgrid/mail');

var bcrypt = require('bcryptjs');
const tutorSubjectModel = require('../models/tutorSubject.model');
const onlineClassModel = require('../models/onlineClass.model');

const salt = bcrypt.genSaltSync(10);

const usersConfig = config.users;
const classConfig = config.class;
const tutorConfig = config.tutors;
const appointmentConfig = config.appointment;
const karmaConfig = config.karma;

exports.createOnlineClass = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var params = req.body;

  var file = req.file;


  if (!file || !params.tutorSubjectId || !params.title || params.title === undefined || !params.tutorClassId || !params.classDescription || params.isPaid === undefined
    || (params.isPaid === 'true' && !params.fee) || !params.availableDays || !params.availableTime
    || params.isPublic === undefined || (params.isPaid === 'true' &&!params.classTimeCategory )
    ||  (params.isPaid === 'true' && !params.currencyId && !params.tutorSyllabusId)
  ) {
    var errors = [];

    if (!req.body.tutorSubjectId) {
      errors.push({
        field: "tutorSubjectId",
        message: "tutorSubjectId cannot be empty"
      })
    }
    if (!file) {
      errors.push({
        field: "image",
        message: "Please select a class image"
      })
    }
    if (!req.body.tutorClassId) {
      errors.push({
        field: "tutorClassId",
        message: "tutorClassId cannot be empty"
      })
    }

    if (!params.title || params.title === undefined) {
      errors.push({
        field: "title",
        message: "title cannot be empty"
      })
    }


    if (!req.body.classDescription) {
      errors.push({
        field: "classDescription",
        message: "classDescription cannot be empty"
      })
    }
    if (params.isPaid === undefined) {
      errors.push({
        field: "isPaid",
        message: "isPaid cannot be empty"
      })
    }
    if (params.isPaid === 'true' && !params.fee) {
      errors.push({
        field: "fee",
        message: "fee cannot be empty"
      })
    }
    if (params.isPaid === 'true' && !params.classTimeCategory) {
      errors.push({
        field: "classTimeCategory",
        message: "classTimeCategory cannot be empty"
      })
    }
    if((params.isPaid === 'true' && !params.currencyId )){
      errors.push({
        field: "currencyId",
        message: "currencyId cannot be empty"
      })
    }

    if (params.isPublic === undefined) {
      errors.push({
        field: "isPublic",
        message: "isPublic cannot be empty"
      })
    }
    if (!req.body.availableDays) {
      errors.push({
        field: "availableDays",
        message: "availableDays cannot be empty"
      })
    }
    if (!req.body.availableTime) {
      errors.push({
        field: "availableTime",
        message: "availableTime cannot be empty"
      })
    }
    if( !params.tutorSyllabusId){
      errors.push({
        field: "tutorSyllabusId",
        message: "tutorSyllabusId cannot be empty"
      })
    }

    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }

  var onlineClassObj = {};
  onlineClassObj.userId = userId;
  onlineClassObj.tutorClassId = params.tutorClassId;
  onlineClassObj.tutorSubjectId = params.tutorSubjectId;
  onlineClassObj.classDescription = params.classDescription;
  onlineClassObj.image = file.filename;
  onlineClassObj.isPaid = params.isPaid;
  onlineClassObj.title = params.title;
  onlineClassObj.tutorSyllabusId = params.tutorSyllabusId;
  onlineClassObj.isPopular = false;
  if (params.isPaid === 'true') {
    onlineClassObj.isPaid = true;
    onlineClassObj.fee = params.fee;
    onlineClassObj.classTimeCategory = params.classTimeCategory;
    onlineClassObj.currencyId = params.currencyId;
  } else {
    onlineClassObj.isPaid = false;
    onlineClassObj.fee = null;
    onlineClassObj.classTimeCategory = null;
    onlineClassObj.currencyId = null;

  }
  if (params.isPublic === 'true') {
    onlineClassObj.isPublic = true;
  } else {
    onlineClassObj.isPublic = false;
  }

  onlineClassObj.availableDays = params.availableDays;
  onlineClassObj.availableTime = params.availableTime;
  onlineClassObj.isApproved = false;
  onlineClassObj.isRejected = false;
  onlineClassObj.status = 1;
  onlineClassObj.tsCreatedAt = Date.now();
  onlineClassObj.tsModifiedAt = null;

  var newOnlineClassObj = new OnlineCLass(onlineClassObj);
  var onlineClassResponse = await newOnlineClassObj.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving online class',
        error: err
      }
    })
  if (onlineClassResponse && (onlineClassResponse.success !== undefined) && (onlineClassResponse.success === 0)) {
    return res.send(onlineClassResponse);
  }
  return res.send({
    success: 1,
    statusCode: 200,
    message: 'Created a class..waiting for admin approval',
  })

}

exports.getClassDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var classId = req.params.id;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
  var classDetails = await OnlineCLass.findOne({
    _id: classId,
    isApproved: true,
    isRejected: false,
    status: 1
  },{
    zoomLink : 0
  })
    .populate([{
      path: 'userId',
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get class details',
        error: err
      }
    })
  if (classDetails && (classDetails.success !== undefined) && (classDetails.success === 0)) {
    return res.send(classDetails);
  }
  if (classDetails) {
    classDetails = JSON.parse(JSON.stringify(classDetails))
    var checkResp = await checkIfJoinLinkAvailable(classDetails, userId);
    if (checkResp && (checkResp.success !== undefined) && (checkResp.success === 0)) {
      return res.send(checkResp);
    }
    if (favouriteData && favouriteData.favouriteClass !== null && favouriteData.favouriteClass !== undefined) {
      var index = await favouriteData.favouriteClass.findIndex(id => JSON.stringify(id) === JSON.stringify(classId));
      if (index > -1) {
        classDetails.isFavourite = true;
      } else {
        classDetails.isFavourite = false;
      }
    } else {
      classDetails.isFavourite = false;
    }

    return res.send({
      success: 1,
      item: classDetails,
      joinLinkAvailable: checkResp.joinLinkAvailable,
      classImageBase: classConfig.imageBase,
      tutorImageBase: usersConfig.imageBase,
      tutorVideoBase: tutorConfig.videoBase,
      message: 'Class details'
    })

  } else {
    return res.send({
      success: 0,
      message: "Class not exists"
    })
  }
}


exports.createTutorRequest = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
 var params = req.body;

  if ( !params.tutorSubjectId || !params.tutorClassId || !params.classDescription) {
    var errors = [];

    if (!req.body.tutorSubjectId) {
      errors.push({
        field: "tutorSubjectId",
        message: "tutorSubjectId cannot be empty"
      })
    }

    if (!req.body.tutorClassId) {
      errors.push({
        field: "tutorClassId",
        message: "tutorClassId cannot be empty"
      })
    }


    if (!req.body.classDescription) {
      errors.push({
        field: "classDescription",
        message: "classDescription cannot be empty"
      })
    }


    return res.status(200).send({
      success: 0,
      errors: errors,
      code: 200
    });
  }
  // validating inputn data 

    var subjectCount = await tutorSubjectModel.countDocuments({status:1,_id:req.body.tutorSubjectId}).catch(err=>{
      return {success:0,message:"could not read document count of subjects"}
    })
    if (subjectCount && subjectCount.success && subjectCount.success === 0){
      return res.send(subjectCount)
    }

    var classCount = await TutorClass.countDocuments({status:1,_id:req.body.tutorClassId}).catch(err=>{
      return {success:0,message:"could not read document count of subjects"}
    })
    if (classCount && classCount.success && classCount.success === 0){
      return res.send(subjectCount)
    }

    if (classCount == 0){
      return res.send({
        success:0,
        message:"specified class is deleted or does not exist"
      })
    }
    if (subjectCount == 0){
      return res.send({
        success:0,
        message:"specified subject is deleted or does not exist"
      })
    }
  //end

  var requestObject = {};
  requestObject.status = 1;
  requestObject.description = 1;
  requestObject.userId = userId;
  requestObject.tsCreatedAt = Date.now();
  requestObject.tsModifiedAt = null;
  requestObject.subject = req.body.tutorSubjectId;
  requestObject.class = req.body.tutorClassId;
  var newrequestObject = new tutorRequestModel(requestObject);
  var newTutorRequestResponse = await newrequestObject.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while saving request',
        error: err
      }
    })
  if (newTutorRequestResponse && (newTutorRequestResponse.success !== undefined) && (newTutorRequestResponse.success === 0)) {
    return res.send(newTutorRequestResponse);
  }
  return res.send({
    success: 1,
    statusCode: 200,
    message: 'Created a request',
  })

}

exports.getZoomLink = async(req,res) => {
  // .populate([{
  //   path: 'tutorSubjectId',
  //   select:'_id:1'
  // }, {
  //   path: 'tutorClassId',
  //   select:'_id:1'
  // }])
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.params;
  var classId = params.id;
  var classDetails = await OnlineCLass.findOne({
    _id: classId,
    isApproved: true,
    isRejected: false,
    status: 1
  }).populate([{
      path: 'tutorSubjectId',
      select:'_id:1'
    }, {
     path: 'tutorClassId',
      select:'_id:1'
    }]).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get class details',
        error: err
      }
    })
    if (classDetails && classDetails.success && classDetails.success === 0){
      return res.send(classDetails);
    }

    if (classDetails){
      if (classDetails.isPublic === true){
        return res.send({
          success:1,
          message:"link to join class",
          link:classDetails.zoomLink
        })
      }
      else {
        var requestDetailsCount = await AppointmentClassRequest.countDocuments({userId:userId,classId:classDetails.tutorClassId,subjectId:classDetails.tutorSubjectId}).catch(err => {
          return {
            success:0,
            message:"did not fetch count of documents"
          }
        })
        if (requestDetailsCount && requestDetailsCount.success && requestDetailsCount.success ===0){
          return res.send(requestDetailsCount);
        }
        if (requestDetailsCount > 0){
          return res.send({
            success:1,
            message:"link to join class",
            link:classDetails.zoomLink
          })
          
        }
        else {
          return res.send({
            success:0,
            message:"link to join class can not be provided since class is private and you have not requested or request is approved"
          
          })
        }
      }
    }
   
}

exports.getClassDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var classId = req.params.id;

  var classId = req.params.id;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
  var classDetails = await OnlineCLass.findOne({
    _id: classId,
    isApproved: true,
    isRejected: false,
    status: 1
  })
    .populate([{
      path: 'userId',
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get class details',
        error: err
      }
    })
  if (classDetails && (classDetails.success !== undefined) && (classDetails.success === 0)) {
    return res.send(classDetails);
  }
  if (classDetails) {
    classDetails = JSON.parse(JSON.stringify(classDetails))
    var checkResp = await checkIfJoinLinkAvailable(classDetails, userId);
    if (checkResp && (checkResp.success !== undefined) && (checkResp.success === 0)) {
      return res.send(checkResp);
    }
    if (favouriteData && favouriteData.favouriteClass !== null && favouriteData.favouriteClass !== undefined) {
      var index = await favouriteData.favouriteClass.findIndex(id => JSON.stringify(id) === JSON.stringify(classId));
      if (index > -1) {
        classDetails.isFavourite = true;
      } else {
        classDetails.isFavourite = false;
      }
    } else {
      classDetails.isFavourite = false;
    }

    return res.send({
      success: 1,
      item: classDetails,
      joinLinkAvailable: checkResp.joinLinkAvailable,
      classImageBase: classConfig.imageBase,
      tutorImageBase: usersConfig.imageBase,
      tutorVideoBase: tutorConfig.videoBase,
      message: 'Class details'
    })

  } else {
    return res.send({
      success: 0,
      message: "Class not exists"
    })
  }
}


exports.listOnlineClasses = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;

  var findCriteria = {};
  if (params.isFavourite !== undefined && params.isFavourite === 'true') {
    findCriteria = { _id: { $in: favouriteData.favouriteClass } };
  }
console.log("params.filters")
console.log(params.filters)
console.log("params.filters")
  if(params.filters){
console.log("Inside filter function")

    var reqFilters = JSON.parse(params.filters);

    var availableFilters = constants.ONLINE_CLASS_FILTERS;

    findCriteria  = await setFIlter(reqFilters,availableFilters,findCriteria)
  }
  if (params.isPublic !== undefined && params.isPublic === 'true') {
    findCriteria.isPublic = true;
  }
  if (params.isPublic !== undefined && params.isPublic === 'false') {
    findCriteria.isPublic = false;
  }
  if (params.isPopular === 'true') {
    findCriteria.isPopular = true;
  }

  if(params.itemType === constants.SUBJECT_SEARCH_TYPE 
    && params.itemId !== undefined && params.itemId !== null){
      findCriteria.tutorSubjectId = params.itemId
    }

  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  console.log("findCriteria")
  console.log(findCriteria)
  console.log("findCriteria")

  var listClassResp = await listClasses(findCriteria, params.perPage, params.page, favouriteData);
  return res.send(listClassResp);
}

exports.listTutorList = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
  var findCriteria = {};
  var params = req.query;
  if (params.isFavourite !== undefined && params.isFavourite === 'true') {
    findCriteria = { _id: { $in: favouriteData.favouriteTutor } };
  }
  if(params.filters){
    var reqFilters = JSON.parse(params.filters);
    var availableFilters = constants.TUTOR_FILTERS;
    findCriteria  = await setFIlter(reqFilters,availableFilters,findCriteria)
  }
  if (params.isPopular === 'true') {
    findCriteria.isPopular = true;
  }

  findCriteria.isTutor = true;
  findCriteria.status = 1;


  var listTutorResp = await listTutors(findCriteria, params.perPage, params.page, favouriteData)
  return res.send(listTutorResp);

}


// rakesh 

exports.listClassForTutor = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var findCriteria = {};
  var params = req.query;



  findCriteria.tutorId = userId;
  findCriteria.isApproved = true;
  findCriteria.status = 1;

  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var onlineClassData = await OnlineCLass.find(findCriteria)
    .populate([{ path: 'tutorSubjectId', }, { path: 'tutorClassId', }]).limit(perPage).skip(offset).sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }

  var totalOnlineClassCount = await OnlineCLass.countDocuments(findCriteria).catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while finding online class count',
      error: err
    }
  })
  if (totalOnlineClassCount && (totalOnlineClassCount.success !== undefined) && (totalOnlineClassCount.success === 0)) {
    return totalOnlineClassCount;
  }

  totalPages = totalOnlineClassCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalOnlineClassCount,
    totalPages
  }
  return res.status(200).send({
    success: 1,
    pagination,
    imageBase: classConfig.imageBase,
    items: onlineClassData,
    message: 'List latest class'
  })


}


exports.listApointmentsForTutor = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var findCriteria = {};
  var params = req.query;


  findCriteria.tutorId = userId;
  findCriteria.isApproved = true;
  findCriteria.status = 1;

  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var AppointmentClassRequestData = await AppointmentClassRequest.find(findCriteria)
    .populate([{ path: 'userId' }, { path: 'tutorClassId' }, { path: 'tutorSubjectId' }]).limit(perPage).skip(offset).sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (AppointmentClassRequestData && (AppointmentClassRequestData.success !== undefined) && (AppointmentClassRequestData.success === 0)) {
    return AppointmentClassRequestData;
  }

  var AppointmentClassRequestDataCount = await OnlineCLass.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding online class count',
        error: err
      }
    })
  if (AppointmentClassRequestDataCount && (AppointmentClassRequestDataCount.success !== undefined) && (AppointmentClassRequestDataCount.success === 0)) {
    return AppointmentClassRequestDataCount;
  }

  totalPages = AppointmentClassRequestDataCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: AppointmentClassRequestDataCount,
    totalPages
  }
  return res.status(200).send({
    success: 1,
    pagination,
    imageBase: usersConfig.imageBase,
    items: AppointmentClassRequestData,
    message: 'List latest requests'
  })


}

// request tutor by rakesh 


exports.getStudentHome = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var tabCheckData = await checkYourTab(params, userId);
  if (tabCheckData && (tabCheckData.success !== undefined) && (tabCheckData.success === 0)) {
    return res.send(tabCheckData);
  }
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
  console.log(2, tabCheckData);
  var findCriteria = {};
  if (tabCheckData.isPublic || (!tabCheckData.isPublic && tabCheckData.isFavourite === null)) {
    findCriteria.isPublic = tabCheckData.isPublic
  } else if (tabCheckData.isFavourite && tabCheckData.isPublic === null) {
    // findCriteria.isFavourite = isFavourite
    console.log(tabCheckData, 4);
    if (tabCheckData.favourites.favouriteClasses) {
      findCriteria = { tutorId: { $in: tabCheckData.favourites.favouriteClasses } };
    }
  }

  if(params.keyword){
    findCriteria.title = {
      $regex: `.*${params.keyword}.*`,
  }
  }
  if(favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor){
    findCriteria.userId =  { $ne: userId } 
  }

  findCriteria.isPopular = true;
  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  var perPage = classConfig.popularInHomeResultsPerPage;
  var page = 1;

  var listPopularClassData = await listClasses(findCriteria, perPage, page, favouriteData);
  if (listPopularClassData && (listPopularClassData.success !== undefined) && (listPopularClassData.success === 0)) {
    return res.send(listPopularClassData);
  }

  perPage = tutorConfig.popularInHomeResultsPerPage;
  findCriteria = {};
  if (tabCheckData.isFavourite && tabCheckData.isPublic === null) {
    // findCriteria.isFavourite = isFavourite
    console.log(tabCheckData.favourites.favouriteTutors);
    if (tabCheckData.favourites.favouriteTutors) {
      findCriteria = { _id: { $in: tabCheckData.favourites.favouriteTutors } };
    }
  }
  if(params.keyword){
    findCriteria.firstName = {
      $regex: `.*${params.keyword}.*`,
  }
  }
  if(favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor){
    findCriteria._id =  { $ne: userId } 
  }

  findCriteria.isPopular = true;
  findCriteria.isTutor = true;
  findCriteria.status = 1;
  console.log(5, findCriteria)
  var listPopularTutorData = await listTutors(findCriteria, params.perPage, params.page, favouriteData)
  if (listPopularTutorData && (listPopularTutorData.success !== undefined) && (listPopularTutorData.success === 0)) {
    return res.send(listPopularTutorData);
  }

  perPage = classConfig.latestInHomeResultsPerPage;


  findCriteria = {};
  if (tabCheckData.isPublic || (!tabCheckData.isPublic && tabCheckData.isFavourite === null)) {
    findCriteria.isPublic = tabCheckData.isPublic
  } else if (tabCheckData.isFavourite && tabCheckData.isPublic === null) {
    // findCriteria.isFavourite = isFavourite
    if (tabCheckData.favourites.favouriteClasses) {
      findCriteria = { tutorId: { $in: tabCheckData.favourites.favouriteClasses } };
    }
  }
  findCriteria.status = 1;
  findCriteria.isApproved = true;
  findCriteria.isRejected = false;
  if(params.keyword){
    findCriteria.title = {
      $regex: `.*${params.keyword}.*`,
  }
  }
  if(favouriteData.isTutor !== undefined && favouriteData.isTutor !== null && favouriteData.isTutor){
    findCriteria.userId =  { $ne: userId } 
  }

  var listLatestClassData = await listClasses(findCriteria, perPage, page, favouriteData);
  if (listLatestClassData && (listLatestClassData.success !== undefined) && (listLatestClassData.success === 0)) {
    return res.send(listLatestClassData);
  }

  return res.send({
    success: 1,
    popularClasses: listPopularClassData.items,
    popularTutors: listPopularTutorData.items,
    latestClasses: listLatestClassData.items,
    classImageBase: classConfig.imageBase,
    tutorImageBase: usersConfig.imageBase,
    message: 'Student home'
  })
}

exports.getTutorDetails = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var favouriteDataResp = await getUserFavouriteData(userId);
  if (favouriteDataResp && (favouriteDataResp.success !== undefined) && (favouriteDataResp.success === 0)) {
    return res.send(favouriteDataResp);
  }
  var favouriteData = favouriteDataResp.favouriteData;
  var tutorId = req.params.id;

  var findCriteria = {};
  findCriteria._id = tutorId;
  findCriteria.isTutor = true;
  findCriteria.status = 1;
  var tutorDetails = await User.findOne(findCriteria)
    .populate([{
      path: 'tutorCourseIds',
    }, {
      path: 'tutorSubjectIds',
    }, {
      path: 'tutorClassIds',
    }, {
      path: 'tutorCategoryIds',
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get tutor details',
        error: err
      }
    })
  if (tutorDetails && (tutorDetails.success !== undefined) && (tutorDetails.success === 0)) {
    return res.send(tutorDetails);
  }
  if (tutorDetails) {
    tutorDetails = JSON.parse(JSON.stringify(tutorDetails));
    if (favouriteData && favouriteData.favouriteTutor !== null && favouriteData.favouriteTutor !== undefined) {
      var index = await favouriteData.favouriteTutor.findIndex(id => JSON.stringify(id) === JSON.stringify(tutorId));
      if (index > -1) {
        tutorDetails.isFavourite = true;
      } else {
        tutorDetails.isFavourite = false;
      }
    } else {
      tutorDetails.isFavourite = false;
    }
    var onlineClassData = await OnlineCLass.find({status: 1,userId:tutorId,isApproved:true,isPublic:true},{zoomLink : 0})
    .populate([{
      path: 'userId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
      }
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
    .limit(5)
    .skip(0)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }
  
    return res.send({
      success: 1,
      item: tutorDetails,
      tutorVideoBase: tutorConfig.videoBase,
      tutorImageBase: usersConfig.imageBase,
      previousClasses:onlineClassData,
      message: 'Tutor details'
    })
  } else {
    return res.send({
      success: 0,
      message: "Tutor not exists"
    })
  }
}

exports.requestAppointment = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;

  var params = req.body;

  if (!params.tutorSubjectId || !params.tutorClassId || !params.tutorId) {
    var errors = [];
    if (!params.tutorSubjectId) {
      errors.push({
        field: "tutorSubjectId",
        message: "subject id missing"
      });
    }
    if (!params.tutorClassId) {
      errors.push({
        field: "tutorClassId",
        message: "class id missing"
      });
    }
    if (!params.tutorId) {
      errors.push({
        field: "tutorId",
        message: "tutor id missing"
      });
    }
    return {
      success: 0,
      errors: errors,
      code: 200
    };
  }


  var checkAppointmentRequestResp = await checkAppointmentRequest(params, userId);
  if (checkAppointmentRequestResp && (checkAppointmentRequestResp.success !== undefined) && (checkAppointmentRequestResp.success === 0)) {
    return res.send(checkAppointmentRequestResp);
  }

  var appointmentClassRequestObj = {};

  appointmentClassRequestObj.userId = userId;
  appointmentClassRequestObj.tutorId = params.tutorId;
  appointmentClassRequestObj.tutorClassId = params.tutorClassId;
  appointmentClassRequestObj.tutorSubjectId = params.tutorSubjectId;
  appointmentClassRequestObj.isApproved = false;
  appointmentClassRequestObj.isRejected = false;
  appointmentClassRequestObj.isStudentDeleted = false;
  appointmentClassRequestObj.isTutorDeleted = false;
  appointmentClassRequestObj.status = 1;
  appointmentClassRequestObj.tsCreatedAt = Date.now();
  appointmentClassRequestObj.tsModifiedAt = null;

  var newAppointmentClassRequest = new AppointmentClassRequest(appointmentClassRequestObj);
  var newAppointmentClassRequestData = await newAppointmentClassRequest.save()
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while save appointment class request',
        error: err
      }
    })
  if (newAppointmentClassRequestData && (newAppointmentClassRequestData.success !== undefined) && (newAppointmentClassRequestData.success === 0)) {
    return res.send(newAppointmentClassRequestData);
  }

  return res.send({
    success: 1,
    message: 'Appointment request sent successfully'
  })

}


exports.updateAppointmentStatus = async (req, res) => {
  var userData = req.identity.data;
  var userId = userData.userId;
  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }
  var params = req.body;
  var appointmentId = req.params.id;

  if (!params.status || (params.status && params.status !== constants.APPROVED_STATUS
    && params.status !== constants.REJECTED_STATUS) ||
    (params.status && params.status === constants.REJECTED_STATUS && !params.comments)) {
    var errors = [];
    if (!params.status) {
      errors.push({
        'field': 'status',
        'message': 'appoinment status required',
      })
    }
    if ((params.status && params.status !== constants.APPROVED_STATUS
      && params.status !== constants.REJECTED_STATUS)) {
      errors.push({
        'field': 'status',
        'message': 'Invalid status',
      })
    }
    if( (params.status && params.status === constants.REJECTED_STATUS && !params.comments)){
      errors.push({
        'field': 'comments',
        'message': 'comments required',
      })
    }
    return res.send({
      success: 0,
      errors
    })
  }
  var isApproved = false;
  var isRejected = false;
  var message = ""
  var comments = null;
  if (params.status === constants.APPROVED_STATUS) {
    isApproved = true;
    comments = null;
    message = 'Appointment accepted successfully'
  } else {
    message = 'Appointment rejected successfully'
    isRejected = false;
    comments = params.comments;

  }


  var checkAppointment = await AppointmentClassRequest.findOne({
    _id: appointmentId,
    tutorId: userId,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while check user',
        error: err
      }
    })
  if (checkAppointment && (checkAppointment.success !== undefined) && (checkAppointment.success === 0)) {
    return res.send(checkAppointment);
  }

  if (checkAppointment && checkAppointment !== null) {
    var checkAppointmentResp = await checkAppointmentStatusCheck(checkAppointment, isApproved, isRejected,comments)
    if (checkAppointmentResp && (checkAppointmentResp.success !== undefined) && (checkAppointmentResp.success === 0)) {
      return res.send(checkAppointmentResp);
    }

    var updateAppointmentStatus = await AppointmentClassRequest.updateOne({
      _id: appointmentId,
      tutorId: userId,
      status: 1
    }, checkAppointmentResp.update)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while check user',
          error: err
        }
      })
    if (updateAppointmentStatus && (updateAppointmentStatus.success !== undefined) && (updateAppointmentStatus.success === 0)) {
      return res.send(updateAppointmentStatus);
    }
    return res.send({
      success: 1,
      message
    })
  } else {
    return res.send({
      success: 0,
      message: 'Appoinment request not exists',
    });
  }

}

exports.deleteStudentAppointmentHistory = async(req,res) =>{
  var userData = req.identity.data;
  var userId = userData.userId;
  var appointmentId = req.params.id;

  var findCriteria = {};
  findCriteria._id = appointmentId;
  findCriteria.userId = userId;
  findCriteria.status = 1;
  var checkAppointmentHistoryResp = await checkAppointmentHistoryRequest(findCriteria,constants.STUDENT_TYPE)
  if (checkAppointmentHistoryResp && (checkAppointmentHistoryResp.success !== undefined) && (checkAppointmentHistoryResp.success === 0)) {
    return res.send(checkAppointmentHistoryResp);
  }

  var update = {};
  update.isStudentDeleted = true;
  update.tsModifiedAt = Date.now();
  var updateAppointmentHistoryResp = await updateAppointmentHistoryRequest(findCriteria,update);
  return res.send(updateAppointmentHistoryResp);
}


exports.deleteTutorDeleteAppointmentHistory = async(req,res) =>{
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }

  var appointmentId = req.params.id;

  var findCriteria = {};
  findCriteria._id = appointmentId;
  findCriteria.tutorId = userId;
  findCriteria.status = 1;
  var checkAppointmentHistoryResp = await checkAppointmentHistoryRequest(findCriteria,constants.TUTOR_TYPE)
  if (checkAppointmentHistoryResp && (checkAppointmentHistoryResp.success !== undefined) && (checkAppointmentHistoryResp.success === 0)) {
    return res.send(checkAppointmentHistoryResp);
  }

  var update = {};
  update.isTutorDeleted = true;
  update.tsModifiedAt = Date.now();
  var updateAppointmentHistoryResp = await updateAppointmentHistoryRequest(findCriteria,update);
  return res.send(updateAppointmentHistoryResp);
}

exports.getStudentAppointmentRequestList = async(req,res) =>{
  var userData = req.identity.data;
  var userId = userData.userId;
  var params = req.query;

  var findCriteria = {};
  findCriteria.userId = userId;
  findCriteria.isStudentDeleted = false;
  findCriteria.status = 1;
 
  var appointmentRequestListResp  = await getAppointmentRequestList(findCriteria, params.perPage, params.page);

  return res.send(appointmentRequestListResp);
}

exports.getTutorAppointmentRequestList = async(req,res) =>{
  var userData = req.identity.data;
  var userId = userData.userId;

  var tutorCheck = await checkUserIsTutor(userId);
  if (tutorCheck && (tutorCheck.success !== undefined) && (tutorCheck.success === 0)) {
    return res.send(tutorCheck);
  }

  var params = req.query;

  var findCriteria = {};
  findCriteria.tutorId = userId;
  findCriteria.isTutorDeleted = false;
  findCriteria.status = 1;

  var appointmentRequestListResp  = await getAppointmentRequestList(findCriteria, params.perPage, params.page);
  return res.send(appointmentRequestListResp);
}




async function checkUserIsTutor(userId) {
  var userData = await User.findOne({
    _id: userId,
    status: 1
  })
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
        message: 'User is a tutor',
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

async function listClasses(findCriteria, perPage, page, favouriteData) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;


  var onlineClassData = await OnlineCLass.find(findCriteria,{zoomLink : 0})
    .populate([{
      path: 'userId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
      }
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }, {
      path: 'tutorSyllabusId',
    }])
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting classes',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }
  var totalOnlineClassCount = await OnlineCLass.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding online class count',
        error: err
      }
    })
  if (totalOnlineClassCount && (totalOnlineClassCount.success !== undefined) && (totalOnlineClassCount.success === 0)) {
    return totalOnlineClassCount;
  }
  onlineClassData = JSON.parse(JSON.stringify(onlineClassData))
  var favouriteClassData = []
  if (favouriteData && favouriteData.favouriteClass && favouriteData.favouriteClass !== null) {
    favouriteClassData = favouriteData.favouriteClass;
  }
  console.log("favouriteClassData")
  console.log(JSON.stringify(favouriteClassData));
  console.log("favouriteClassData")
  onlineClassData = await checkAndSetFavourite(onlineClassData, favouriteClassData)
  totalPages = totalOnlineClassCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalOnlineClassCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase: classConfig.imageBase,
    items: onlineClassData,
    message: 'List latest class'
  }
}


async function listTutors(findCriteria, perPage, page, favouriteData) {
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || tutorConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : tutorConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var tutorsData = await User.find(findCriteria)
    .populate([{
      path: 'tutorCourseIds'
    }, {
      path: 'tutorSubjectIds'
    }, {
      path: 'tutorClassIds'
    }, {
      path: 'tutorCategoryIds'
    }])
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting tutors',
        error: err
      }
    })
  if (tutorsData && (tutorsData.success !== undefined) && (tutorsData.success === 0)) {
    return tutorsData;
  }
  tutorsData = JSON.parse(JSON.stringify(tutorsData))
  var favouriteTutorData = []
  if (favouriteData && favouriteData.favouriteTutor && favouriteData.favouriteTutor !== null) {
    favouriteTutorData = favouriteData.favouriteTutor;
  }
  tutorsData = await checkAndSetFavourite(tutorsData, favouriteTutorData)
  var totalTutorsCount = await User.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding total tutors count',
        error: err
      }
    })
  if (totalTutorsCount && (totalTutorsCount.success !== undefined) && (totalTutorsCount.success === 0)) {
    return totalTutorsCount;
  }

  totalPages = totalTutorsCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalTutorsCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase: usersConfig.imageBase,
    items: tutorsData,
    message: 'List tutors'
  }

}

async function checkAppointmentRequest(params, userId) {
  var checkAppountmentData = await AppointmentClassRequest.findOne({
    userId,
    tutorId: params.tutorId,
    classId: params.classId,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while save appointment class request',
        error: err
      }
    })
  if (checkAppountmentData && (checkAppountmentData.success !== undefined) && (checkAppountmentData.success === 0)) {
    return checkAppountmentData;
  }
  if (checkAppountmentData) {
    if (!checkAppountmentData.isApproved && !checkAppountmentData.isRejected) {
      return {
        success: 0,
        message: 'Already sent an appointment request'
      }
    } else if (checkAppountmentData.isApproved) {
      return {
        success: 0,
        message: 'Already sent an appointment request and your request already apporoved'
      }
    } else {
      return {
        success: 1,
        message: 'Your old appontment request rejected'
      }
    }

  } else {
    return {
      success: 1,
      message: 'New appoinment request'
    }
  }
}


async function checkYourTab(params, userId) {
  if (!params.tabType) {
    return {
      success: 0,
      message: "Tab type required"
    }
  }
  if (params.tabType !== constants.PUBLIC_TAB
    && params.tabType !== constants.PRIVATE_TAB
    && params.tabType !== constants.FAVOURITES_TAB
    && params.tabType !== constants.OFFLINE_TAB) {
    return {
      success: 0,
      message: "Invalid tab"
    }
  }

  if (params.tabType === constants.PUBLIC_TAB) {
    console.log("inside public");
    return {
      success: 1,
      isPublic: true,
      isFavourite: null,
      message: 'Public tab'
    }
  } else if (params.tabType === constants.PRIVATE_TAB) {
    return {
      success: 1,
      isPublic: false,
      isFavourite: null,
      message: 'Private tab'
    }
  } else if (params.tabType === constants.FAVOURITES_TAB) {
    var favourites = await getFavouriteDetails(params, userId);
    console.log(3, favourites)


    return {
      success: 1,
      isFavourite: true,
      isPublic: null,
      favourites: favourites,
      message: 'Favourites tab'
    }
  } else {
    return {
      success: 1,
      isFavourite: null,
      isPublic: null,
      message: 'Offline tab'
    }
  }
}

async function getFavouriteDetails(params, userId) {

  var returnObject = {};

  var infoFavourites = await User.findOne({ status: 1, _id: userId }, { _id: 1, favouriteClass: 1, favouriteTutor: 1 })
    .catch(error => {

      return {
        success: 0,
        error: error.message,
        message: "could not get favourite classes"
      }
    });

  if (infoFavourites && infoFavourites.success && infoFavourites.success === 0) {
    return infoFavourites
  }
  console.log(1, infoFavourites, userId);
  if (infoFavourites != null) {
    returnObject.favouriteClasses = infoFavourites.favouriteClass;
    returnObject.favouriteTutors = infoFavourites.favouriteTutor;
  }
  else {
    return {
      success: 0,
      message: "No recored for this user"
    }
  }

  return returnObject;

}

async function checkClassIsPrivate(params) {
  var onlineClassData = await OnlineCLass.findOne({
    _id: params.tutorClassId,
    _id: params.tutorClassId,
    isPublic: false,
    isApproved: true,
    status: 1
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking private class',
        error: err
      }
    })
  if (onlineClassData && (onlineClassData.success !== undefined) && (onlineClassData.success === 0)) {
    return onlineClassData;
  }
  console.log("onlineClassData")
  console.log(onlineClassData)
  console.log("onlineClassData")
  if (onlineClassData && onlineClassData !== null) {
    return {
      success: 1,
      message: 'Private class',
    }
  } else {
    return {
      success: 0,
      message: 'Invalid private class',
    }
  }
}



async function checkAppointmentStatusCheck(appointmentData, isApproved, isRejected,comments) {
  if (appointmentData.isApproved && isApproved) {
    return {
      success: 0,
      message: 'Appoinment request already approved',
    };
  } else if (appointmentData.isRejected && isRejected) {
    return {
      success: 0,
      message: 'Appoinment request already rejected',
    };
  }
  var updateObj = {};
  if (isApproved) {
    var findCriteria = {};
    findCriteria.tutorSubjectId = appointmentData.tutorSubjectId;
    findCriteria.tutorClassId = appointmentData.tutorClassId;
    findCriteria.isPublic = false;
    findCriteria.isApproved = true;
    findCriteria.isRejected = false;
    findCriteria.status = 1;

    var checkOnlineClass = await OnlineCLass.findOne(findCriteria)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking user is a tutor',
          error: err
        }
      })
    if (checkOnlineClass && (checkOnlineClass.success !== undefined) && (userData.success === 0)) {
      return checkOnlineClass;
    }
    if (!checkOnlineClass || checkOnlineClass === null) {
      return {
        success: 0,
        message: 'Requested online class not added, So add class',
      };
    } else {
      updateObj.isApproved = true;
      updateObj.comments = null;
      updateObj.tsModifiedAt = Date.now();

      return {
        success: 1,
        message: 'Approve status',
        update: updateObj
      }
    }
  } else {
    updateObj.isRejected = true;
    updateObj.comments = comments;
    updateObj.tsModifiedAt = Date.now();
    return {
      success: 1,
      message: 'Reject status',
      update: updateObj
    }
  }
}


async function checkIfJoinLinkAvailable(classDetails, userId) {
  if (classDetails.isPublic) {
    return {
      success: 1,
      joinLinkAvailable: true,
      message: 'Public class'
    }
  } else {
    var appointmentCheckResp = await AppointmentClassRequest.findOne({
      userId,
      tutorId: classDetails.userId.id,
      tutorSubjectId: classDetails.tutorSubjectId.id,
      tutorClassId: classDetails.tutorClassId.id,
      isApproved: true,
      isRejected: false,
      status: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while checking appointment request approve or not',
          error: err
        }
      })
    if (appointmentCheckResp && (appointmentCheckResp.success !== undefined) && (appointmentCheckResp.success === 0)) {
      return appointmentCheckResp;
    }
    if (appointmentCheckResp && appointmentCheckResp !== null) {
      return {
        success: 1,
        joinLinkAvailable: true,
        message: 'Private class with approved appointment request'
      }

    } else {
      return {
        success: 1,
        joinLinkAvailable: false,
        message: 'Private class not approve appointment or not sent request'
      }
    }
  }
}

async function getUserFavouriteData(userId) {
  var favouriteData = await User.findOne({
    _id: userId,
    status: 1
  }, {
    favouriteTutor: 1,
    favouriteClass: 1,
    isTutor
  })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting favourite data',
        error: err
      }
    })
  if (favouriteData && (favouriteData.success !== undefined) && (favouriteData.success === 0)) {
    return favouriteData;
  }
  if (favouriteData && favouriteData !== null) {
    return {
      success: 1,
      favouriteData,
      message: 'Users favourite data',
    }
  } else {
    return {
      success: 0,
      message: 'User not exists',
    }
  }
}

async function checkAndSetFavourite(listData, favouriteData) {
  if (favouriteData && favouriteData.length > 0) {
    for (let i = 0; i < listData.length; i++) {
      let index = await favouriteData.findIndex(id => JSON.stringify(id) === JSON.stringify(listData[i].id));
      if (index > -1) {
        listData[i].isFavourite = true;
      } else {
        listData[i].isFavourite = false;
      }
    }
    return listData;
  } else {
    for (let i = 0; i < listData.length; i++) {
      listData[i].isFavourite = false;
    }
    return listData;
  }
}


async function setFIlter(reqFilters,availableFilters,findCriteria){
    var i = 0;
    var j;
    var k;
    while(i < availableFilters.length){
      j = 0;
      filtersLen = reqFilters.length;
      console.log("User entered filters length is " + filtersLen);
      while (j < filtersLen) {
        if (reqFilters[j].name == availableFilters[i].name) {
          var reqValues = [];
          if (reqFilters[j].values && Array.isArray(reqFilters[j].values) && reqFilters[j].values.length) {
            k = 0;
            while (k < reqFilters[j].values.length) {
              if (ObjectId.isValid(reqFilters[j].values[k]))
                reqValues.push(reqFilters[j].values[k]);
              k++;
            }
            findCriteria[String(availableFilters[i].value)] = {
              $in: reqValues
            };
            console.log("Filters Upadated" + JSON.stringify(findCriteria));
          }
        }
        j++;
      }
      i++;
    }

    return findCriteria;
}


async function getAppointmentRequestList(findCriteria, perPage, page){
  var page = Number(page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(perPage) || appointmentConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : appointmentConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var appointmentClassRequestData = await AppointmentClassRequest.find(findCriteria)
    .populate([{
      path: 'userId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
      }
    },{
      path: 'tutorId',
      select: {
        firstName: 1,
        image: 1,
        socialPhotoUrl: 1
      }
    }, {
      path: 'tutorSubjectId',
    }, {
      path: 'tutorClassId',
    }])
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    }).catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting  appointment class requests',
        error: err
      }
    })
  if (appointmentClassRequestData && (appointmentClassRequestData.success !== undefined) && (appointmentClassRequestData.success === 0)) {
    return appointmentClassRequestData;
  }
  var totalAppointmentClassRequestCount = await AppointmentClassRequest.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding appointment class request count',
        error: err
      }
    })
  if (totalAppointmentClassRequestCount && (totalAppointmentClassRequestCount.success !== undefined) && (totalAppointmentClassRequestCount.success === 0)) {
    return totalAppointmentClassRequestCount;
  }


  totalPages = totalAppointmentClassRequestCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalAppointmentClassRequestCount,
    totalPages
  }
  return {
    success: 1,
    pagination,
    imageBase : usersConfig.imageBase,
    items: appointmentClassRequestData,
    message: 'List appointment request'
  }
}


async function checkAppointmentHistoryRequest(findCriteria,type){
  var appointmentCheck = await AppointmentClassRequest.findOne(findCriteria)
  .catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while checking appointment class request',
      error: err
    }
  })
if (appointmentCheck && (appointmentCheck.success !== undefined) && (appointmentCheck.success === 0)) {
  return appointmentCheck;
}
if(appointmentCheck){
  if(appointmentCheck.isApproved === false && appointmentCheck.isRejected === false){
    return {
      success: 0,
      message: 'Appointment is currently pending..so can not delete',
    }
  }else{
    if(type === constants.STUDENT_TYPE && appointmentCheck.isStudentDeleted){
      return {
        success: 0,
        message: 'Appointment request is already deleted',
      }
    }else if(type === constants.TUTOR_TYPE && appointmentCheck.isTutorDeleted){
      return {
        success: 0,
        message: 'Appointment request is already deleted',
      }
    }else{
      return {
        success: 1,
        message: 'Appointment check OK..',
      }
    }
   
  }
}else{
  return {
    success: 0,
    message: 'Invalid appointment',
  }
}
}


async function updateAppointmentHistoryRequest(findCriteria,update){
  var updateAppointmentRequest = await AppointmentClassRequest.updateOne(findCriteria,update)
  .catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while deleting appointment class request from history',
      error: err
    }
  })
if (updateAppointmentRequest && (updateAppointmentRequest.success !== undefined) && (updateAppointmentRequest.success === 0)) {
  return updateAppointmentRequest;
}
return {
  success : 1,
  message : 'Deleted appointment from history'
}
}



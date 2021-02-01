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

 const Alumni = require('../models/alumni.model.js');

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

exports.addAlumni = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.body;

    var errors = [];

    if (!params.groupName){
        errors.push({
            filed:"groupName",
            message:"please add a name for your group"
        })
    }


    if (errors.length > 0){
        return res.send({
            success:0,
            message:"failed",
            error:errors
        })
    }

    var imagePath = req.file ? req.file.filename : null;

    const newObject = {
        fullName: params.fullName,
        address: params.address,
        companyName : params.companyName,
        description: params.description,
        image:imagePath,
        designation: params.designation,
        passingYear: params.passingYear,
        email: params.email,
        contact: params.contact,
        facebook: params.facebook,
        linkedin: params.linkedin,
        groupName: params.groupName,
        groupTargets: params.groupTargets,
        createdBy:userId,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj = new Alumni(newObject);
    const newGroup = await  obj.save().catch(err => {
        console.log(err.message,"<=error")
        return {
            success: 0,
            message:"could not create new group",
            error:err.message,
        }
    })

    res.send({
        success: 1,
        message:"success",
        item:newGroup
    })
}
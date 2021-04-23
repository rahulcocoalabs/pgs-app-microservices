var config = require('../../config/app.config.js');
const Alumni = require('../models/alumni.model.js');
const User = require('../models/user.model.js');
const AlumniJoinRequest = require('../models/alumniJoinRequest.model.js');
const AlumniEventParticipation = require('../models/alumniEventParticipation.model.js');
const AlumniEvent = require('../models/alumniEvents.model.js');
const AlumniJob = require('../models/alumniJobs.model.js');
const AlumniContest = require('../models/alumniContests.model.js');

const AlumniContestPermissions = require('../models/alumniContestPermission.model.js');
const contestImageBase = config.alumni.contestImageBase;
const imageBase = config.alumni.imageBase;
const userImageBase = config.users.imageBase;
const constants = require('../helpers/constants.js');
const { TUTOR_TYPE, TODAYS_EVENT_TYPE } = require('../helpers/constants.js');
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
const axios = require('axios');
var FormData = require('form-data');
//const { CronJob } = require('cron');
const cron = require('node-cron');
exports.addAlumni = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.body;

    var errors = [];

    if (!params.groupName) {
        errors.push({
            filed: "groupName",
            message: "please add a name for your group"
        })
    }


    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "failed",
            error: errors
        })
    }

    var imagePath = req.file ? req.file.filename : null;

    const newObject = {
        fullName: params.fullName,
        address: params.address,
        companyName: params.companyName,
        description: params.description,
        image: imagePath,
        batch: params.batch,
        designation: params.designation,
        passingYear: params.passingYear,
        email: params.email,
        contact: params.contact,
        facebook: params.facebook,
        linkedin: params.linkedin,
        groupName: params.groupName,
        groupTargets: params.groupTargets,
        createdBy: userId,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj = new Alumni(newObject);
    const newGroup = await obj.save().catch(err => {
        console.log(err.message, "<=error")
        return {
            success: 0,
            message: "could not create new group",
            error: err.message,
        }
    })

    const newObject1 = {

        user: userId,
        isApproved: constants.ALUMNI_STATUS_ACCEPTED,
        group: newGroup._id,
        status: 1,
        isAdmin: true,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj1 = new AlumniJoinRequest(newObject1);
    const newGroupReq = await obj1.save().catch(err => {
        console.log(err.message, "<=error")
        return {
            success: 0,
            message: "could not create request for join alumni",
            error: err.message,
        }
    })

    if (newGroupReq && newGroupReq.success != undefined && newGroupReq.success === 0) {
        return res.send(newGroupReq);
    }

    const userDataInfo = await User.findOne({
        _id: userId,
        status: 1

    }, {
        _id: 1,
        email: 1,
        password: 1,
        firstName: 1
    })

    var bodyFormData = new FormData();

    try {
        bodyFormData.append('mongoId', userDataInfo._id);
        bodyFormData.append('username', "");
        bodyFormData.append('password', userDataInfo.password);
        bodyFormData.append('email', userDataInfo.email);

    }
    catch (err) {
        console.log(err.message);
    }
    const phpInfo = await axios({
        method: 'post',
        url: 'https://backend.pgsedu.com/alumnis/insert',
        data: bodyFormData
    }).catch(err => {
        console.log(err.message);
    })

    console.log(phpInfo);

    res.send({
        success: 1,
        message: "successfully created new alumni group"
    })
}

exports.listAlumni = async (req, res) => {


    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    var dataAlumni = await Alumni.find({ status: 1 }, { createdBy: 0 }, pageParams).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0) {
        return res.send(dataAlumni)
    }

    var dataAlumniCount = await Alumni.countDocuments({ status: 1 }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumniCount && dataAlumniCount.success != undefined && dataAlumniCount.success === 0) {
        return res.send(dataAlumniCount)
    }

    var itemsCount = dataAlumni.length;
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    // if (page > totalPages) {
    //     return res.send({
    //         success: 0,
    //         message: "No groups to show"
    //     })
    // }

    return res.send({
        success: 1,
        pagination,
        message: "listed successfully",
        imageBase,
        itemCount: dataAlumniCount,
        items: dataAlumni
    })
}

exports.listAlumni1 = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    // from alumni join request get elements of approved request from same userId project group only

    var count = await AlumniJoinRequest.find({ status: 1, user: userId, isApproved: "ACCEPTED" }).catch(err => {
        return { success: 0, message: "something went wrong", error: err.message }
    })

    if (count && count.success != undefined && count.success === 0) {
        return res.send(count)
    }

    var group = []

    // shrink the array by eliminating duplicate values


    for (x in count) {

        var elem = count[x];
        var groupId = elem.group;
        // var cond = group.includes(groupId);

        //  if (cond === false) {
        group.push(groupId)
        // }
    }




    var arr1 = await Alumni.find({ status: 1, _id: { $in: group } }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (arr1 && arr1.success != undefined && arr1.success === 0) {
        return res.send(arr1)
    }


    var arr3 = [];

    for (x in arr1) {

        var elem1 = {};
        var elem = arr1[x];

        elem1.isMember = 1;
        elem1._id = elem.id;
        elem1.image = elem.image;
        elem1.groupName = elem.groupName;
        elem1.description = elem.description;
        elem1.passingYear = elem.passingYear;
        // for (var propKey in elem)
        //     elem1[propKey] = elem[propKey];

        if (elem.createdBy == userId) {
            elem1.isAdmin = 1;
        }
        else {
            elem1.isAdmin = 0;
        }

        arr3.push(elem1);
    }


    var arr2 = await Alumni.find({ status: 1, _id: { $nin: group } }, { createdBy: 0 }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (arr2 && arr2.success != undefined && arr2.success === 0) {
        return res.send(arr2)
    }

    var arr = arr3.concat(arr2);

    var itemsCount = arr.length;
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    if ((offset + perPage) < arr.length) {

        var output = arr.slice(offset, perPage);

        return res.send({
            success: 1,
            message: "listed successfully",
            imageBase,
            pagination,

            items: output,
        })
    }

    if ((offset + perPage) > arr.length && (offset) < arr.length) {



        var output = arr.slice(offset, (offset + (arr.length - offset)));

        return res.send({
            success: 1,
            message: "listed successfully",
            items: output,
            imageBase,

            pagination
        })
    }




    return res.send({
        success: 0,
        items: [],
        message: "nor documents to show"

    })



}

exports.joinRequest = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    const params = req.body;
    var errors = [];
    if (!params.groupId) {
        errors.push({
            filed: "groupId",
            message: "please add a name for your group Id"
        })
    }
    if (!params.name) {
        errors.push({
            filed: "name",
            message: "please add a name "
        })
    }
    if (!params.comments) {
        errors.push({
            filed: "comments",
            message: "please add  comments "
        })
    }


    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "failed",
            error: errors
        })
    }

    const countOfReq = await AlumniJoinRequest.countDocuments({ status: 1, user: userId, group: params.groupId }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (countOfReq && countOfReq.success != undefined && countOfReq.success === 0) {
        return res.send(countOfReq)
    }


    if (countOfReq > 0) {
        return res.send({
            success: 0,
            message: "already added a request for joining this group"
        })
    }

    const newObject = {
        name: params.name,
        comments: params.comments,
        address: params.address,
        companyName: params.address,
        designation: params.designation,
        college: params.college,
        batch: params.batch,
        passingYear: params.passingYear,
        contact: params.contact,
        email: params.email,
        fbLink: params.fbLink,
        linkedLink: params.linkedLink,
        user: userId,
        isApproved: constants.ALUMNI_STATUS_PENDING,
        group: params.groupId,
        status: 1,
        isAdmin: false,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj = new AlumniJoinRequest(newObject);
    const newGroupReq = await obj.save().catch(err => {
        console.log(err.message, "<=error")
        return {
            success: 0,
            message: "could not create request for join alumni",
            error: err.message,
        }
    })

    if (newGroupReq && newGroupReq.success != undefined && newGroupReq.success === 0) {
        return res.send(newGroupReq);
    }

    var groupInfo = await Alumni.findOne({ _id: params.groupId }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (groupInfo && groupInfo.success != undefined && groupInfo.success === 0) {
        return res.send(groupInfo)
    }



    var owner = groupInfo.createdBy || "";



    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
        title: " Request for joining group",
        message: "Some has sent you a request to join the group",
        type: constants.ALUMNI_JOIN_REQUEST_NOTIFICATION_TYPE,
        filtersJsonArr,
        // metaInfo,
        typeId: params.groupId,
        userId: owner,
        notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)

    res.send({
        success: 1,
        message: "successfully submitted your request"
    })

}

exports.details = async (req, res) => {
    const data = req.identity.data;
    const userId = data.userId;
    const id = req.params.id;

    var group = await Alumni.findOne({ status: 1, _id: id }).populate({ path: 'createdBy', select: { "firstName": 1, "image": 1 } }).catch(err => {
        return { success: 0, message: "did not get detail for group", error: err.message }
    })

    if (group && group.success != undefined && group.success === 0) {
        return res.send(group);
    }

    var returnObj = {};


    if (group.createdBy.id == userId) {
        returnObj.isAdmin = 1;
    }
    else {
        returnObj.isAdmin = 0;
    }

    var pageParams = {
        skip: 0,
        limit: 10
    };


    var people = await AlumniJoinRequest.find({ isApproved: constants.ALUMNI_STATUS_ACCEPTED, status: 1, group: id }, {}, pageParams).populate({ path: 'user', select: { "firstName": 1, "image": 1 } }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (people && people.success != undefined && people.success === 0) {
        return res.send(people);
    }

    var peopleCount = await AlumniJoinRequest.countDocuments({ isApproved: constants.ALUMNI_STATUS_ACCEPTED, status: 1, group: id }).populate({ path: 'user', select: { "firstName": 1, "image": 1 } }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (peopleCount && peopleCount.success != undefined && peopleCount.success === 0) {
        return res.send(peopleCount);
    }

    var userInfo = await AlumniJoinRequest.findOne({ status: 1, user: userId, group: id }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    });

    if (userInfo && userInfo.success != undefined && userInfo.success === 0) {
        return res.send(userInfo);
    }

    var isMember = 0;

    var didRequested = 0;

    if (userInfo) {
        if (userInfo.isApproved == constants.ALUMNI_STATUS_ACCEPTED) {
            isMember = 1;
        }

    }

    var membersArray = [];

    for (x in people) {

        var member = {};

        if (people[x].isAdmin == true) {
            member.isAdmin = 1;
        }
        else {
            member.isAdmin = 0;
        }

        member.designation = people[x].designation || "";
        member.user = people[x].user;
        member._id = people[x]._id;
        membersArray.push(member);
    }

    const countOfReq = await AlumniJoinRequest.countDocuments({ status: 1, user: userId, group: id }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (countOfReq && countOfReq.success != undefined && countOfReq.success === 0) {
        return res.send(countOfReq)
    }


    if (countOfReq > 0) {
        didRequested = 1;
    }


    returnObj.success = 1;
    returnObj.message = "description of group retrieved successfully";
    returnObj.groupInfo = group;
    returnObj.membersCount = peopleCount;
    returnObj.members = membersArray;
    returnObj.imageBase = imageBase;
    returnObj.userImageBase = userImageBase;
    returnObj.isMember = isMember || 0;

    returnObj.didRequested = didRequested || 0;
    return res.send(returnObj);

}

exports.listJoinRequests = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    if (!params.groupId) {
        return res.send({
            success: 0,
            message: "please provide a group ID"
        })
    }

    var dataAlumniRequest = await AlumniJoinRequest.find({ status: 1, group: params.groupId, isApproved: constants.ALUMNI_STATUS_PENDING }, {}, pageParams).populate({
        path: 'user',
        select: { image: 1 }
    }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumniRequest && dataAlumniRequest.success != undefined && dataAlumniRequest.success === 0) {
        return res.send(dataAlumniRequest)
    }

    var dataAlumniCount = await AlumniJoinRequest.countDocuments({ status: 1, group: params.groupId, isApproved: constants.ALUMNI_STATUS_PENDING }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumniCount && dataAlumniCount.success != undefined && dataAlumniCount.success === 0) {
        return res.send(dataAlumniCount)
    }

    var itemsCount = dataAlumniCount;
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    return res.send({
        success: 1,
        pagination,
        userImageBase,
        message: "listed successfully",
        items: dataAlumniRequest
    })
}

exports.joineeDetail = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;


    if (!params.joineeId) {
        return res.send({
            success: 0,
            message: "please provide a joinees's ID"
        })
    }

    var dataAlumniRequest = await AlumniJoinRequest.findOne({ status: 1, _id: params.joineeId }, { isAdmin: 0 }).populate({
        path: 'user',
        select: { image: 1, firstName: 1 }
    }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumniRequest && dataAlumniRequest.success != undefined && dataAlumniRequest.success === 0) {
        return res.send(dataAlumniRequest)
    }

    if (dataAlumniRequest === null) {
        return res.send({
            success: 0,
            message: "this joinee is removed or rejected"
        })
    }



    return res.send({
        success: 1,

        userImageBase,
        message: "details fetched successfully",
        items: dataAlumniRequest
    })
}

exports.acceptJoinRequests = async (req, res) => {


    const data = req.identity.data;
    const userId = data.userId;
    var id = req.params.id;
    if (!req.query) {
        return res.send({
            success: 0,
            message: "no query found"

        })
    }
    var group = req.query.group;
    var status = req.query.status;
    var id = req.params.id;

    var errors = [];

    if (!group) {
        errors.push({
            filed: "groupName",
            message: "please mention id of your group"
        })
    }
    if (!status) {
        errors.push({
            filed: "status",
            message: "please add status"
        })
    }
    if (!id) {
        errors.push({
            filed: "status",
            message: "please add id of request"
        })
    }


    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "failed",
            error: errors
        })
    }

    if (!(status == constants.ALUMNI_STATUS_ACCEPTED) && !(status == constants.ALUMNI_STATUS_REJECTED)) {
        return res.send({
            success: 0,
            message: " value for staus is not allowed"

        })
    }


    var info = await Alumni.findOne({ status: 1, _id: group }).populate('group').catch(err => {
        return {
            success: 0,
            message: "some thing went wrong",
            error: err.message
        }
    })

    if (info && info.success != undefined && info.success == 0) {
        return res.send(info);
    }

    console.log(info, userId);
    var admin = 0;
    if (info) {
        if (info.createdBy) {

            if (userId == info.createdBy) {
                admin = 1;
            }

        }
    }

    var info1 = await AlumniJoinRequest.findOne({ status: 1, user: userId }).catch(err => {
        return {
            success: 0,
            message: "some thing went wrong",
            error: err.message
        }
    })

    if (info1 && info1.success != undefined && info1.success == 0) {
        return res.send(info1);
    }

    if (info1.isAdmin == true) {
        admin = 1;
    }



    if (admin == 1) {
        var update = await AlumniJoinRequest.updateOne({ status: 1, _id: id }, { isApproved: status }).catch(err => {
            return {
                success: 0,
                message: "some thing went wrong",
                error: err.message
            }
        })
        if (update && update.success != undefined && update.success == 0) {
            return res.send(update);
        }

        var info = await AlumniJoinRequest.findOne({ status: 1, _id: id }).catch(err => {
            return {
                success: 0,
                message: "some thing went wrong",
                error: err.message
            }
        })
        if (info && info.success != undefined && info.success == 0) {
            return res.send(info);
        }

        var user = info.user;

        var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": user }]

        var notificationObj = {
            title: "Accepted your request for joining group",
            message: "Admin has accepted your request to join the group",
            type: constants.ALUMNI_JOIN_REQUEST_NOTIFICATION_TYPE,
            filtersJsonArr,
            // metaInfo,
            typeId: group,
            userId: user,
            notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
        }
        let notificationData = await pushNotificationHelper.sendNotification(notificationObj)


        return res.send({
            success: 1,
            message: "processed successfully"
        })

    }
    else {
        return res.send({
            success: 0,
            message: "you are not authorized to process this request"
        })
    }


}

exports.addAlumniEvents = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.body;

    var errors = [];

    if (!params.groupId) {
        errors.push({
            filed: "groupName",
            message: "please add id for your group"
        })
    }


    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "failed",
            error: errors
        })
    }

    var userInfo = await AlumniJoinRequest.findOne({ status: 1, user: userId, group: params.groupId }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    });

    if (userInfo && userInfo.success != undefined && userInfo.success === 0) {
        return res.send(userInfo);
    }




    if (userInfo) {
        if (userInfo.isAdmin == false) {
            return res.send({
                success: 0,
                message: "you are not authorized for this action"
            })
        }
    }
    else {
        return res.send({
            success: 0,
            message: "you are not authorized for this action"
        })
    }

    var imagePath = req.file ? req.file.filename : null;

    const newObject = {
        title: params.title,
        description: params.description,
        venue: params.venue,
        date: params.date,
        groupId: params.groupId,
        image: imagePath,
        availableFromTime: params.availableFromTime,
        availableToTime: params.availableToTime,
        liveLink: params.liveLink,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj = new AlumniEvent(newObject);
    const event = await obj.save().catch(err => {

        return {
            success: 0,
            message: "could not create new group",
            error: err.message,
        }
    })

    res.send({
        success: 1,
        message: "successfully added event details"
    })
}

exports.editEvents = async (req, res) => {


    var params = req.body;
    var file = req.file;
    var update = {};

    if (params.title) {
        update.title = params.title;
    }
    if (params.description) {
        update.description = params.description;
    }
    if (params.venue) {
        update.venue = params.venue;
    }
    if (params.date) {
        update.date = params.date;
    }

    if (file) {

        if (file.filename) {

            update.image = file.filename;
        }
    }
    if (params.availableFromTime) {
        update.availableFromTime = params.availableFromTime;
    }
    if (params.availableToTime) {
        update.availableToTime = params.availableToTime;
    }
    if (params.liveLink) {
        update.descrliveLinkiption = params.liveLink;
    }

    var filter = { status: 1, _id: req.params.id }

    var data = await AlumniEvent.updateOne(filter, update).catch(err => {
        return { success: 0, message: "something went wrong", error: err.message }
    })

    return res.send({ success: 1, message: "successfully updated" })


}

exports.deleteEvents = async (req, res) => {



    var update = { status: 0 };


    var filter = { status: 1, _id: req.params.id }

    var data = await AlumniEvent.updateOne(filter, update).catch(err => {
        return { success: 0, message: "something went wrong", error: err.message }
    })

    return res.send({ success: 1, message: "successfully removed" })


}

exports.addAlumniJobs = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.body;

    var errors = [];

    if (!params.groupId) {
        errors.push({
            filed: "groupName",
            message: "please add id for your group"
        })
    }


    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "failed",
            error: errors
        })
    }

    var imagePath = req.file ? req.file.filename : null;

    const newObject = {
        position: params.position,
        description: params.description,
        company: params.company,
        location: params.location,
        email: params.email,
        groupId: params.groupId,
        image: imagePath,
        createdBy: userId,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj = new AlumniJob(newObject);
    const event = await obj.save().catch(err => {

        return {
            success: 0,
            message: "could not create new group",
            error: err.message,
        }
    })

    res.send({
        success: 1,
        message: "successfully added job details"
    })
}

exports.listEvents = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;

    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    if (!params.groupId) {
        return res.send({
            success: 0,
            message: "please provide a group ID"
        })
    }


    var dataAlumni = await AlumniEvent.find({ status: 1, groupId: params.groupId }, { status: 0, tsModifiedAt: 0, tsCreatedAt: 0 }, pageParams).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0) {
        return res.send(dataAlumni)
    }

    var itemsCount = dataAlumni.length;
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }


    var itemArr = [];
    for (x in dataAlumni) {

        let data = dataAlumni[x];
        var obj = {};
        obj.description = data.description;
        obj.title = data.title;
        obj.date = data.date;
        obj._id = data._id;
        obj.image = data.image;
        var isEnded = false;
        var d1 = Date.parse(data.date);
        var d2 = Date.now();
        if (d1 < d2) {
            isEnded = true;
        }
        obj.isEnded = isEnded;
        itemArr.push(obj);
    }
    return res.send({
        success: 1,
        pagination,
        imageBase,
        message: "listed successfully",
        items: itemArr
    })



}

exports.listJobs = async (req, res) => {
    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;

    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    if (!params.groupId) {
        return res.send({
            success: 0,
            message: "please provide a group ID"
        })
    }


    var dataAlumni = await AlumniJob.find({ status: 1, groupId: params.groupId }, { status: 0, tsModifiedAt: 0, tsCreatedAt: 0 }, pageParams).populate({ path: "createdBy", select: { firstName: 1, middleName: 1, lastName: 1, image: 1 } }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0) {
        return res.send(dataAlumni)
    }

    var itemsCount = dataAlumni.length;
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    return res.send({
        success: 1,
        pagination,
        imageBase,
        userImageBase,
        message: "listed successfully",
        items: dataAlumni
    })

}

exports.detailsEvents = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.params;



    if (!params.id) {
        return res.send({
            success: 0,
            message: "please provide a event ID"
        })
    }


    var dataAlumni = await AlumniEvent.findOne({ status: 1, _id: params.id }, { status: 0, tsModifiedAt: 0, tsCreatedAt: 0 }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0) {
        return res.send(dataAlumni)
    }
    var isParticipated = 0;

    var AlumniEventParticipationCount = await AlumniEventParticipation.countDocuments({ status: 1, eventId: params.id, userId: userId }).catch(err => {
        return { success: 0, message: err.message }
    })

    if (AlumniEventParticipationCount && AlumniEventParticipationCount.success != undefined && AlumniEventParticipationCount.success === 0) {
        return res.send(AlumniEventParticipationCount)
    }

    if (AlumniEventParticipationCount > 0) {
        isParticipated = 1;
    }

    return res.send({
        success: 1,
        message: "listed successfully",
        isParticipated: isParticipated,
        imageBase,
        items: dataAlumni
    })



}
exports.detailsJobs = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.params;



    if (!params.id) {
        return res.send({
            success: 0,
            message: "please provide a job ID"
        })
    }


    var dataAlumni = await AlumniJob.findOne({ status: 1, _id: params.id }, { status: 0, tsModifiedAt: 0, tsCreatedAt: 0 }).populate({ path: "createdBy", select: { firstName: 1, middleName: 1, lastName: 1, image: 1 } }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0) {
        return res.send(dataAlumni)
    }

    return res.send({
        success: 1,
        message: "listed successfully",
        imageBase,
        userImageBase,
        items: dataAlumni
    })



}

exports.eventParticipate = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.body;

    var errors = [];

    if (!params.count) {
        errors.push({
            fileds: "count",
            message: "please mention number of attendees"
        })
    }
    if (!params.email) {
        errors.push({
            fileds: "email",
            message: "please mention email"
        })
    }
    if (!params.name) {
        errors.push({
            fileds: "name",
            message: "please mention   name"
        })
    }

    if (!req.params) {
        return res.send({
            success: 0,
            message: "no event id recieved"
        })
    }
    if (!req.params.id) {
        return res.send({
            success: 0,
            message: "no event id recieved"
        })
    }

    const eventCheck = await AlumniEventParticipation.countDocuments({ status: 1, eventId: req.params.id, userId, userId }).catch(err => {
        return {
            success: 0,
            message: "could not connect to  db ",
            error: err.message
        }
    })

    if (eventCheck && eventCheck.success != undefined && eventCheck.success === 0) {
        return res.send(eventCheck);

    }

    if (eventCheck > 0) {
        return res.send({ success: 0, message: "already participated in this event" })
    }


    const event1 = await AlumniEvent.findOne({ status: 1, _id: req.params.id }).catch(err => {
        return {
            success: 0,
            message: "could not connect to  db ",
            error: err.message
        }
    })

    if (event1 && event1.success != undefined && event1.success === 0) {
        return res.send(event1);

    }

    var groupId = event1.groupId;

    const eventId = req.params.id;
    const newObject = {
        name: params.name,
        eventId: eventId,
        email: params.email,
        attendeeCount: params.count,
        user: userId,
        group: groupId,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null

    }

    const obj = new AlumniEventParticipation(newObject);
    const newGroupReq = await obj.save().catch(err => {
        console.log(err.message, "<=error")
        return {
            success: 0,
            message: "could not create request for join alumni",
            error: err.message,
        }
    })

    if (newGroupReq && newGroupReq.success != undefined && newGroupReq.success === 0) {
        return res.send(newGroupReq);
    }

    var groupInfo = await Alumni.findOne({ _id: groupId }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (groupInfo && groupInfo.success != undefined && groupInfo.success === 0) {
        return res.send(groupInfo)
    }

    var owner = groupInfo.createdBy || "";

    var event = await AlumniEvent.findOne({ _id: eventId }, { title: 1 }).catch(err => {
        return { success: 0, message: "some error occurred", error: err.message }
    })
    if (event && event.success != undefined && event.success == 0) {
        return res.send(event);
    }
    var name = event.title || "";

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var message = params.name + " " + "will participate on event" + " " + name;

    var notificationObj = {
        title: "Event participation",
        message: message,
        type: constants.ALUMNI_EVENT_PARTICIPATION,
        filtersJsonArr,
        // metaInfo,
        typeId: req.params.id,
        userId: owner,
        notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)

    res.send({
        success: 1,
        message: "success",
        item: newGroupReq
    })


}

exports.listMembers = async (req, res) => {


    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    if (!params.groupId) {
        return res.send({
            success: 0,
            message: "mention group id"
        })
    }

    var dataAlumni = await AlumniJoinRequest.find({ status: 1, isApproved: constants.ALUMNI_STATUS_ACCEPTED, group: params.groupId }, { designation: 1, user: 1, isAdmin: 1 }, pageParams).populate({ path: 'user', select: { "firstName": 1, "image": 1 } }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0) {
        return res.send(dataAlumni)
    }

    var dataAlumniCount = await AlumniJoinRequest.countDocuments({ status: 1, isApproved: constants.ALUMNI_STATUS_ACCEPTED, group: params.groupId }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (dataAlumniCount && dataAlumniCount.success != undefined && dataAlumniCount.success === 0) {
        return res.send(dataAlumniCount)
    }

    var membersArray = [];

    for (x in dataAlumni) {

        var member = {};

        if (dataAlumni[x].isAdmin == true) {
            member.isAdmin = 1;
        }
        else {
            member.isAdmin = 0;
        }

        member.designation = dataAlumni[x].designation || "";
        member.user = dataAlumni[x].user;
        member._id = dataAlumni[x]._id;
        membersArray.push(member);
    }

    var itemsCount = dataAlumniCount;
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    // if (page > totalPages) {
    //     return res.send({
    //         success: 0,
    //         message: "No members to show"
    //     })
    // }

    return res.send({
        success: 1,
        pagination,
        message: "listed successfully",
        userImageBase,
        itemCount: dataAlumniCount,
        items: membersArray
    })

}

exports.setAdmin = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;



    if (!req.params.id) {
        return res.send({
            success: 0,
            message: "mention group id"
        })
    }
    var groupId = req.params.id;
    if (!params.user) {
        return res.send({
            success: 0,
            message: "mention user id"
        })
    }

    var countData = await Alumni.countDocuments({ status: 1, _id: groupId, createdBy: userId }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (countData && countData.success != undefined && countData.success === 0) {
        return res.send(countData)
    }



    if (countData == 0) {

        return res.send({
            success: 0,
            message: "you are not authorized for this action"
        })
    }


    var countData1 = await Alumni.countDocuments({ status: 1, _id: groupId, isAdmin: true }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (countData1 && countData1.success != undefined && countData1.success === 0) {
        return res.send(countData1)
    }





    if (countData == 0) {

        return res.send({
            success: 0,
            message: "you are not authorized for this action"
        })
    }

    if (countData1 > 4) {
        return res.send({
            success: 0,
            message: "you can not add new admin since five admins are in the group"
        })
    }




    var updateData = await AlumniJoinRequest.updateOne({ status: 1, group: groupId, user: params.user }, { isAdmin: true }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (updateData && updateData.success != undefined && updateData.success === 0) {
        return res.send(updateData)
    }
    return res.send({
        success: 1,

        message: "set as admin  successfully",

    })
}


exports.deleteAdmin = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.query;




    if (!req.params.id) {
        return res.send({
            success: 0,
            message: "mention group id"
        })
    }
    var groupId = req.params.id;
    if (!params.user) {
        return res.send({
            success: 0,
            message: "mention user id"
        })
    }
    console.log(groupId, userId)
    var countData = await Alumni.countDocuments({ status: 1, _id: groupId, createdBy: userId }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (countData && countData.success != undefined && countData.success === 0) {
        return res.send(countData)
    }

    console.log(groupId, userId, countData)

    if (countData == 0) {

        return res.send({
            success: 0,
            message: "you are not authorized for this action"
        })
    }



    var updateData = await AlumniJoinRequest.updateOne({ status: 1, group: groupId, user: params.user }, { isAdmin: false }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (updateData && updateData.success != undefined && updateData.success === 0) {
        return res.send(updateData)
    }
    return res.send({
        success: 1,

        message: "removed as admin  successfully",

    })
}

exports.listContest = async (req, res) => {

    const params = req.query;
    const id = req.params.id;

    if (!params) {
        return res.send({
            success: 0,
            message: "please provide tab type"
        })
    }
    if (!params.tabtype) {
        return res.send({
            success: 0,
            message: "please provide tab type"
        })
    }
    if (params.tabtype != "upcoming" && params.tabtype != "past") {
        return res.send({
            success: 0,
            message: "please provide vaild tab type"
        })
    }

    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    var approvedContest = await AlumniContestPermissions.find({ status: 1, alumni: id, permission: "accepted" }, { contest: 1 }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (approvedContest && approvedContest.success != undefined && approvedContest.success === 0) {
        return res.send(approvedContest);
    }

    const approvedContestIds = approvedContest.map(contestItem => contestItem.contest);


    var filter = {};
    filter.status = 1;
    filter._id = { $in: approvedContestIds };
    const presentTime = Date.now();

    if (params.tabtype == "past") {
        filter.toDate = { $lt: presentTime };
    }
    else {
        filter.toDate = { $gt: presentTime };
    }


    var projection = {};
    projection.fromDate = 1;
    projection.toDate = 1;
    projection.title = 1;
    projection.image = 1;

    var list = AlumniContest.find(filter, projection, pageParams).then((result) => {

        if (!result) {
            return res.send({
                success: 0,
                message: "no data available"
            })
        }
        else {

            var count = AlumniContest.countDocuments(filter).then((countofDocs) => {

                var itemsCount = countofDocs
                var totalPages = itemsCount / perPage;
                totalPages = Math.ceil(totalPages);
                var hasNextPage = page < totalPages;
                var pagination = {
                    page: page,
                    perPage: perPage,
                    hasNextPage: hasNextPage,
                    totalItems: itemsCount,
                    totalPages: totalPages
                }

                return res.send({
                    success: 1,
                    message: "data available",
                    imageBase: contestImageBase,
                    pagination,
                    items: result,

                })

            }).catch((err) => {
                return res.send({
                    success: 0,
                    message: "something went wrong",
                    error: err.message
                })
            })


        }
    }).catch((err) => {
        return res.send({
            success: 0,
            message: "something went wrong",
            error: err.message
        })
    })

}


exports.listContestForPermission = async (req, res) => {

    const params = req.query;
    const id = req.params.id;



    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    var approvedContest = await AlumniContestPermissions.find({ status: 1, alumni: id }, { contest: 1 }).catch(err => {
        return {
            success: 0,
            message: "did not fetch details from database",
            error: err.message
        }
    })

    if (approvedContest && approvedContest.success != undefined && approvedContest.success === 0) {
        return res.send(approvedContest);
    }

    const approvedContestIds = approvedContest.map(contestItem => contestItem.contest);


    var filter = {};
    filter.status = 1;
    filter._id = { $nin: approvedContestIds }




    //  filter.groups = query.groupId;



    var projection = {};
    projection.fromDate = 1;
    projection.toDate = 1;
    projection.title = 1;
    projection.image = 1;

    var list1 = await AlumniContest.find(filter, projection, pageParams).catch((err) => {
        return {
            success: 0,
            message: "something went wrong",
            error: err.message
        }
    })

    if (list1 && list1.success != undefined && list1.success === 0) {
        return res.send(list1);
    }

    var count = await AlumniContest.countDocuments(filter).catch((err) => {
        return {
            success: 0,
            message: "something went wrong",
            error: err.message
        }
    })

    if (count && count.success != undefined && count.success === 0) {
        return res.send(count);
    }
    var itemsCount = count
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    return res.send({
        success: 1,
        message: "data available",
        imageBase: contestImageBase,
        pagination,

        items: list1
    })

}

exports.contestPermission = async (req, res) => {

    const body = req.body;

    var errors = [];
    if (!body.status) {
        errors.push({
            filed: "status",
            message: "please fill status"
        })
    }
    if (!body.alumni) {
        errors.push({
            filed: "alumni",
            message: "please fill alumni"
        })
    }
    if (!body.contest) {
        errors.push({
            filed: "contest",
            message: "please fill contest"
        })
    }

    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "please fill all fields",
            error: errors
        })
    }

    if (!(body.status == "accepted" || body.status == "rejected")) {
        return res.send({
            success: 0,
            body: body.status,
            message: "please provide valide status accept or reject"
        })
    }

    const obj = {
        contest: body.contest,
        alumni: body.alumni,
        permission: body.status,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null
    }

    const saver = new AlumniContestPermissions(obj);
    var saveData = await saver.save().catch((err) => {
        return {
            success: 0,
            message: "something went wrong",
            error: err.message
        }
    });

    if (saveData && saveData.success !== undefined && saveData.success === 0) {
        return res.send(saveData)
    }

    return res.send({
        success: 1,
        message: "success",
        saveData
    })
}

exports.detailOfContest = async (req, res) => {

    const id = req.params.id;

    const item = await AlumniContest.findOne({ _id: id, status: 1 }, { tsCreatedAt: 0, tsModifiedAt: 0, status: 0 }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (item && item.success != undefined && item.success === 0) {
        return res.send(item);
    }

    return res.send({
        success: 0,
        message: "success",
        item: item
    })

}

exports.deleteAll = async (req, res) => {

    var x = await Alumni.updateMany({}, { status: 0 })
    var y = await AlumniJoinRequest.updateMany({}, { status: 0 })
    var z = await AlumniEvent.updateMany({}, { status: 0 })
    var a = await AlumniEventParticipation.updateMany({}, { status: 0 })
    var b = await AlumniJob.updateMany({}, { status: 0 })
    var c = await AlumniJoinRequest.updateMany({}, { status: 0 })

    return res.send("ok")
}


var CronJob = require('cron').CronJob;

var job = new CronJob(' 0 06 * * *', async function () {
    console.log('You will see this message every second');

    var today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dd = today.getDate();
    var mm = today.getMonth();

    var yyyy = today.getFullYear();
    const today1 = dd + " " + months[mm] + " " + yyyy;
    console.log(" < -------- started1")

    var events1 = AlumniEvent.find({ status: 1 }).populate({ path: 'groupId' }).then((results) => {
        console.log(results)
    })

    var events = await AlumniEvent.find({ status: 1 }).populate({ path: 'groupId' }).catch(err => {
        console.log(" < -------- end1")
        return { success: 0, message: "did not get detail for requests", error: err.message }
    })

    if (events && events.success != undefined && events.success === 0) {
        console.log(" < -------- end")
        return;
    }
    console.log(" < -------- started2")
    for (x in events) {
        console.log(" < -------- inside for loops")
        var event = events[x];
        let id = event._id;
        var joinees = AlumniEventParticipation.find({ eventId: id, status: 1 }).catch(err => {
            return { success: 0, message: "did not get detail for requests", error: err.message }
        })
        if (events && events.success != undefined && events.success === 0) {
            continue;
        }

        for (y in joinees) {

            var joinee = joinees[y];
            var owner = joinee.userId;

            var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

            var notificationObj = {
                title: " Today's Event",
                message: "Event is today, don't forget to join!",
                type: constants.ALUMNI_EVENT_PARTICIPATION,
                filtersJsonArr,
                // metaInfo,
                typeId: event._id,
                userId: owner,
                notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
            }
            let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
        }

        console.log(event);
        if (event.groupId == null) { continue }
        let groupOwner = event.groupId.createdBy;
        var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": groupOwner }]

        var notificationObj = {
            title: " Today's Event",
            message: "Event is today, don't forget to join!",
            type: constants.ALUMNI_EVENT_PARTICIPATION,
            filtersJsonArr,
            // metaInfo,
            typeId: event._id,
            userId: groupOwner,
            notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
        }
        let notificationData = await pushNotificationHelper.sendNotification(notificationObj)


    }
}, null, true, 'Asia/Kolkata');
job.start();
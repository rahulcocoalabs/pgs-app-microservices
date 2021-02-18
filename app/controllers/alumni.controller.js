var config = require('../../config/app.config.js');
const Alumni = require('../models/alumni.model.js');
const AlumniJoinRequest = require('../models/alumniJoinRequest.model.js');
const AlumniEventParticipation = require('../models/alumniEventParticipation.model.js');
const AlumniEvent = require('../models/alumniEvents.model.js');
const AlumniJob = require('../models/alumniJobs.model.js');
const imageBase = config.alumni.imageBase;
const userImageBase = config.users.imageBase;
const constants = require('../helpers/constants.js');
const { TUTOR_TYPE } = require('../helpers/constants.js');

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


    if (errors.length > 0) {
        return res.send({
            success: 0,
            message: "failed",
            error: errors
        })
    }

    const newObject = {
        name: params.name,
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

    var userInfo = await AlumniJoinRequest.findOne({ status: 1, user: userId }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    });

    if (userInfo && userInfo.success != undefined && userInfo.success === 0) {
        return res.send(userInfo);
    }

    var isMember = 0;
    var isAdmin = 0;

    if (userInfo){
        if (userInfo.isApproved == constants.ALUMNI_STATUS_ACCEPTED) {
            isMember = 1;
        }
        if (userInfo.isAdmin == true) {
            isAdmin = 1;
        }
    }

    var membersArray = [];

    for (x in people){

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

    console.log(userId)
    console.log(userInfo)

    returnObj.success = 1;
    returnObj.message = "description of group retrieved successfully";
    returnObj.groupInfo = group;
    returnObj.membersCount = peopleCount;
    returnObj.members = membersArray;
    returnObj.imageBase = imageBase;
    returnObj.userImageBase = userImageBase;
    returnObj.isMember = isMember;
    returnObj.isAdmin = isAdmin;
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

    var dataAlumniCount = await AlumniJoinRequest.countDocuments({ status: 1 }).catch(err => {
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

    var dataAlumniRequest = await AlumniJoinRequest.findOne({ status: 1, _id: params.joineeId },{isAdmin:0}).populate({
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

    var userInfo = await AlumniJoinRequest.findOne({ status: 1, user: userId }).catch(err => {
        return { success: 0, message: "did not get detail for requests", error: err.message }
    });

    if (userInfo && userInfo.success != undefined && userInfo.success === 0) {
        return res.send(userInfo);
    }




    if (userInfo.isAdmin == false) {
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
        email:params.email,
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

    

    return res.send({
        success: 1,
        pagination,
        imageBase,
        message: "listed successfully",
        items: dataAlumni
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

    var AlumniEventParticipationCount = await AlumniEventParticipation.countDocuments({status: 1,eventId:params.id,userId:userId}).catch(err=>{
        return {success:0,message:err.message}
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


    var dataAlumni = await AlumniJob.findOne({ status: 1, _id: params.id }, { status: 0, tsModifiedAt: 0, tsCreatedAt: 0 }).catch(err => {
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
    const eventId = req.params.id;
    const newObject = {
        name: params.name,
        eventId: eventId,
        email: params.email,
        attendeeCount: params.count,
        user: userId,
        group: params.groupId,
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
    
    for (x in dataAlumni){

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

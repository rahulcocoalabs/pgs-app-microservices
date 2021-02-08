var config = require('../../config/app.config.js');
const Alumni = require('../models/alumni.model.js');
const AlumniJoinRequest = require('../models/alumniJoinRequest.model.js');
const AlumniEventParticipation = require('../models/alumniEventParticipation.model.js');
const AlumniEvent = require('../models/alumniEvents.model.js');
const AlumniJob = require('../models/alumniJobs.model.js');
const imageBase = config.alumni.imageBase;
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
        batch:params.batch,
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

    var dataAlumni = await Alumni.find({ status: 1 }, {}, pageParams).catch(err => {
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

    if (page > totalPages) {
        return res.send({
            success: 0,
            message: "No products to show"
        })
    }

    return res.send({
        success: 1,
        pagination,
        message: "listed successfully",
        imageBase,
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
        email:params.email,
        fbLink: params.fbLink,
        linkedLink: params.linkedLink,
        user: userId,
        group: params.groupId,
        status: 1,
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
        message: "success",
        item: newGroupReq
    })

}

exports.details = async (req, res) => {
    const data = req.identity.data;
    const userId = data.userId;
    const id = req.params.id;

    var group = await Alumni.findOne({ status: 1, _id: id }).catch(err => {
        return { success: 0, message: "did not get detail for group", error: err.message }
    })

    if (group && group.success != undefined && group.success === 0) {
        return res.send(group);
    }

    var returnObj = {};

    if (group.created == userId) {
        returnObj.isAdmin = 1;
    }
    else {
        returnObj.isAdmin = 0;
    }

    var people = await AlumniJoinRequest.find($or[{ status: 2 },{isApproved:true}]).populate("createdBy").catch(err => {
        return { success: 0, message: "did not get detail for requesta", error: err.message }
    })

    if (people && people.success != undefined && people.success === 0) {
        return res.send(people);
    }

    returnObj.success = 1;
    returnObj.message = "description of group retrieved successfully";
    returnObj.groupInfo = group;
    returnObj.members = people;
    returnObj.imageBase = imageBase;
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

    var dataAlumniRequest = await AlumniJoinRequest.find({ status: 1, group: params.groupId }, {}, pageParams).populate({
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

    return res.send({
        success: 1,
        message: "listed successfully",
        items: dataAlumniRequest
    })
}

exports.acceptJoinRequests = async (req, res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var id = req.params.id;
    var group = req.query.group;


    var info = await await AlumniJoinRequest.findOne({ status: 1, group: group }).populate('group').catch(err => {
        return {
            success: 0,
            message: "some thing went wrong",
            error: err.message
        }
    })

    if (info && info.success != undefined && info.success == 0) {
        return res.send(info);
    }

    var admin = 0;
    if (info) {
        if (info.group) {
            if (info.group.createdBy) {
                if (userId == info.group.createdBy) {
                    admin = 1;
                }
            }
        }
    }

    if (admin == 1) {
        var update = await AlumniJoinRequest.updateOne({ status: 1, _id: id }, { status: 2 }).catch(err => {
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
            success: 0,
            message: "accepted"
        })

    }
    else {
        return res.send({
            success: 0,
            message: "you are not authorized to accept this request"
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
        title: params.title,
        description: params.description,
        venue: params.venue,
        date: params.date,
        groupId:params.groupId,
        image:imagePath,
      

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
        message: "success",
        item: event
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
        position: params.title,
        description: params.description,
        company: params.venue,
        location: params.date,
        groupId:params.groupId,
        image:imagePath,
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
        message: "success",
        item: event
    })
}

exports.listEvents = async (req,res) => {

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

    if (!params.groupId){
        return res.send({
            success:0,
            message:"please provide a group ID"
        })
    }

    
    var dataAlumni = await AlumniEvent.find({ status: 1,groupId:params.groupId }, {status:0,tsModifiedAt:0,tsCreatedAt:0}, pageParams).catch(err => {
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

exports.listJobs = async (req,res) => {
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

    if (!params.groupId){
        return res.send({
            success:0,
            message:"please provide a group ID"
        })
    }

    
    var dataAlumni = await AlumniJob.find({ status: 1,groupId:params.groupId }, {status:0,tsModifiedAt:0,tsCreatedAt:0}, pageParams).catch(err => {
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
        pagination,
        imageBase,
        message: "listed successfully",
        items: dataAlumni
    })

}

exports.detailsEvents = async (req,res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.params;

   

    if (!params.id){
        return res.send({
            success:0,
            message:"please provide a event ID"
        })
    }

    
    var dataAlumni = await AlumniEvent.findOne({ status: 1,_id:params.id }, {status:0,tsModifiedAt:0,tsCreatedAt:0}).catch(err => {
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
exports.detailsJobs = async (req,res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.params;

   

    if (!params.id){
        return res.send({
            success:0,
            message:"please provide a job ID"
        })
    }

    
    var dataAlumni = await AlumniJob.findOne({ status: 1,_id:params.id }, {status:0,tsModifiedAt:0,tsCreatedAt:0}).catch(err => {
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

exports.eventParticipate = async (req,res) => {

    const data = req.identity.data;
    const userId = data.userId;
    var params = req.body;

    var errors = [];

    if (!params.count){
        errors.push({
            fileds:"count",
            message:"please mention number of attendees"
        })
    }
    if (!params.email){
        errors.push({
            fileds:"email",
            message:"please mention email"
        })
    }
    if (!params.name){
        errors.push({
            fileds:"name",
            message:"please mention   name"
        })
    }
    const newObject = {
        name: params.name,
        eventId:params.eventId,
        email:params.email,
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

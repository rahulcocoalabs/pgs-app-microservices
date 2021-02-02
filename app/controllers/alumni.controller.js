var config = require('../../config/app.config.js');
const Alumni = require('../models/alumni.model.js');
const AlumniJoinRequest = require('../models/alumniJoinRequest.model.js');

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
        designation: params.designation,
        passingYear: params.passingYear,
        email: params.email,
        contact: params.contact,
        facebook: params.facebook,
        linkedin: params.linkedin,
        groupName: params.groupName,
        groupTargets: params.groupTargets,
        createdBy: userId,
        status:1,
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
        message: "success",
        item: newGroup
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

    var dataAlumni = await Alumni.find({ status: 1 }, {}, pageParams).catch(err=>{
        return{
            success:0,
            message:"did not fetch details from database",
            error:err.message
        }
    })

    if (dataAlumni && dataAlumni.success != undefined && dataAlumni.success === 0){
        return res.send(dataAlumni)
    }

    return res.send({
        success:1,
        message:"listed successfully",
        items:dataAlumni
    })
}

exports.joinRequest = async(req, res)=>{

    const data = req.identity.data;
    const userId = data.userId;
    
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
        user:userId,
        group:groupId,
        status:1,
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

    if (newGroupReq && newGroupReq.success != undefined && newGroupReq.success === 0){
        return res.send(newGroupReq);
    }

    res.send({
        success: 1,
        message: "success",
        item: newGroupReq
    })

}
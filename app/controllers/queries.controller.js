const express = require("express");
const cors = require("cors");
var config = require('../../config/app.config.js');
const queryConfig = config.queries;
const app = express();
app.use(cors());
const Setting = require('../models/setting.model');
const sgMail = require('@sendgrid/mail');
const QueryCategory = require('../models/queryCategory.model');
const Consultant = require('../models/queryConsultant.model');
const query = require('../models/query.model');
const constants = require('../helpers/constants');
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
exports.getCategories = async (req, res) => {


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || queryConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : queryConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    const categories = await QueryCategory.find({ status: 1 }, { name: 1, image: 1, description: 1 }, pageParams).catch(err => {
        return { success: 0, message: err.message }
    });

    if (categories && categories.success !== undefined && categories.success === 0) {
        return res.send(categories);
    }

    return res.send({ success: 1, message: "success", items: categories, imageBase: queryConfig.imageBase });


}
exports.getConsultants = async (req, res) => {


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || queryConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : queryConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    const id = req.params.id;
    const consultants = await Consultant.find({ status: 1, category: id }, { name: 1, image: 1, description: 1 }, pageParams).catch(err => {
        return { success: 0, message: err.message }
    });

    if (consultants && consultants.success !== undefined && consultants.success === 0) {
        return res.send(categories);
    }

    return res.send({ success: 1, message: "success", items: consultants, imageBase: queryConfig.imageBase });


}

exports.consultantDetails = async (req, res) => {



    const id = req.params.id;
    const consultants = await Consultant.findOne({ status: 1, _id: id },).catch(err => {
        return { success: 0, message: err.message }
    });

    if (consultants && consultants.success !== undefined && consultants.success === 0) {
        return res.send(categories);
    }

    return res.send({ success: 1, message: "success", items: consultants, imageBase: queryConfig.imageBase });


}

exports.postQuery = async (req, res) => {


    const body = req.body;
    const userData = req.identity.data;
    const userId = userData.userId;
    const consultantId = req.params.id;
    var errors = [];

    const consultantInfo = await Consultant.findOne({ status: 1, _id: consultantId }).catch(err => {
        return {
            success: 0,
            message: err.message
        }
    })

    console.log('04/06')
    console.log(consultantInfo)
    console.log(consultantInfo.email)
    const email = consultantInfo.email;

    if (!email) {
        return res.send({
            success: 0,
            message: "could not load consultant's email"
        })
    }

    if (consultantInfo && consultantInfo.success != undefined && consultantInfo.success === 0) {
        return res.send(consultantInfo);
    }
    if (body.question) {
        errors.push({
            field: "question",
            message: "question cannot be empty"
        })
    }
    if (body.category) {
        errors.push({
            field: "category",
            message: "category cannot be empty"
        })
    }

    const code = Math.floor(Math.random() * (1000000000 - 1)) + 1;

    const newObj = new query({
        question: body.question,
        answer: null,
        isAnswered: false,
        code: code,
        category: body.category,
        consultant: consultantId,
        userId: userId,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null
    })

    const saveData = await newObj.save().catch(err => {
        return {
            success: 0,
            message: err.message
        }
    });

    if (saveData && saveData.success != undefined && saveData.success === 0) {
        return res.send(saveData);
    }

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

        if (!saveData._id) {
            return res.send({
                success: 0,
                message: "some technical issues"
            })
        }

        const link = "https://www.pgsedu.com/queries/#/index.html" + "/" + saveData._id
        const mailmsg = "You have a question from a user  and code is "  + code + " click to answer " + link;
        sgMail.setApiKey(settingData.value);


        const x = await sendMail(mailmsg, email, "Queries from users in PGS app");

        if (x && (x == 1)) {
            return res.json({
                success: 0,
                message: "Mail could not be sent"
            })
        }
    }

    return res.send({
        success: 1,
        message: "success"
    })

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

exports.addAnswer = async (req, res) => {

    const body = req.body;
   // const userData = req.identity.data;
    //const userId = userData.userId;
    const queryId = req.params.id;
    var errors = [];

    if (!body.answer) {
        errors.push({
            field: "answer",
            message: "answer cannot be empty"
        })
    }
    if (!body.code) {
        errors.push({
            field: "code",
            message: "code cannot be empty"
        })
    }

    if (errors.length > 0) {
        return res.send({
            success: 0,
            errors: errors
        })
    }

    const updateData = await query.updateOne({ status: 1, _id: queryId, code: body.code }, { answer: body.answer, tsModifiedAt: Date.now(), isAnswered: true }).catch(err => {
        return {
            success: 0,
            message: err.message
        }
    })

    if (updateData && updateData.success != undefined && updateData.success === 0) {

        return res.send(updateData)
    }

    if(!updateData) {
        return res.send({ status:0, message: "could not update"})
    }

    const queryInfo = await query.findOne({ status: 1, _id: queryId, code: body.code }).catch(err => {
        return { success: 0, message: err.message}
    })

    if (queryInfo && queryInfo.success != undefined && queryInfo.success === 0) {
        return res.send(queryInfo);
    }

    const owner = queryInfo.userId;

    var filtersJsonArr = [{ "field": "tag", "key": "user_id", "relation": "=", "value": owner }]

    var notificationObj = {
        title: " Answer for your question",
        message: "Consultant has replied to your question",
        type: constants.QUERY_REPLY,
        filtersJsonArr,
        // metaInfo,
        //typeId: event._id,
        userId: owner,
        notificationType: constants.INDIVIDUAL_NOTIFICATION_TYPE
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)

    return res.send({
        success: 1,
        message: "success"
    })
}

exports.showQuery = async (req, res) => {



    const id = req.params.id;
    const queryList = await query.findOne({
        _id: id, status: 1, isAnswered: false
    }, { tsCreatedAt: 0 }).catch(err => {
        return {
            success: 0, message: err.message
        }
    })

    if (queryList && queryList.success != undefined && queryList.success === 0) {
        return res.send(queryList)
    }

    return res.send({
        success: 1, items: queryList, message: 'success'
    })
}

exports.listChat = async (req, res) => {


    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || queryConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : queryConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    const id = req.params.id;
    const queryList = await query.find({
        consultant: id, status: 1, isAnswered: true
    }, { tsCreatedAt: 0 }, pageParams).catch(err => {
        return {
            success: 0, message: err.message
        }
    })

    if (queryList && queryList.success != undefined && queryList.success === 0) {
        return res.send(queryList)
    }

    return res.send({
        success: 1, items: queryList, message: 'success'
    })
}

exports.listHistory = async (req, res) => {

    const userData = req.identity.data;
    const userId = userData.userId;

    var params = req.query;
    var page = params.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || queryConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : queryConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    const id = req.params.id;
    const queryList = await query.find({
        userId: userId, status: 1
    }, { tsCreatedAt: 0 }, pageParams).populate([
    'category','consultant']
     ).catch(err => {
        return {
            success: 0, message: err.message
        }
    })

    if (queryList && queryList.success != undefined && queryList.success === 0) {
        return res.send(queryList)
    }

    return res.send({
        success: 1, items: queryList, message: 'success'
    })
}
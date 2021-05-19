const express = require("express");
const cors = require("cors");
var config = require('../../config/app.config.js');
const queryConfig = config.queries;
const app = express();
app.use(cors());

const QueryCategory = require('../models/queryCategory.model');
const Consultant = require('../models/queryConsultant.model');
const query = require('../models/query.model');

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
        return { success:0, message: err.message }
    });

    if(categories && categories.success !== undefined && categories.success === 0){
        return res.send(categories);
    }

    return res.send({ success:1, message: "success",items:categories,imageBase:queryConfig.imageBase});


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
    const consultants = await Consultant.find({ status: 1 ,category:id}, { name: 1, image: 1, description: 1 }, pageParams).catch(err => {
        return { success:0, message: err.message }
    });

    if(consultants && consultants.success !== undefined && consultants.success === 0){
        return res.send(categories);
    }

    return res.send({ success:1, message: "success",items:consultants,imageBase:queryConfig.imageBase});


}

exports.postQuery = async (req, res) => {


    const body = req.body;
    const userData = req.identity.data.userId;
    const userId = userData.userId;
    const consultantId = req.params.id;
    var errors = [];

    if(body.question){
        errors.push({
            field: "question",
            message: "question cannot be empty"
        })
    }
    if(body.category){
        errors.push({
            field: "category",
            message: "category cannot be empty"
        })
    }
    
    const code = Math.floor(Math.random() * (1000000000 - 1)) + 1;

    const newObj = new query({
        question:body.question,
        answer:null,
        isAnswered:false,
        code:code,
        category: body.category,
        consultant: id,
        userId: userId,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null
    })

    const saveData = await newObj.save().catch(err => {
        return {
            success:0,
            message:err.message
        }
    });

    if (saveData && saveData.success != undefined && saveData.success === 0){
        return res.send(saveData);
    }

    return res.send({
        success:1,
        message:"success"
    })

}

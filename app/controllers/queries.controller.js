const express = require("express");
const cors = require("cors");
var config = require('../../config/app.config.js');
const queryConfig = config.queries;
const app = express();
app.use(cors());

const QueryCategory = require('../models/queryCategory.model');
const Consultant = require('../models/queryConsultant.model');


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

    if(categories && categories.success !== undefined && categories.success === 0){
        return res.send(categories);
    }

    return res.send({ success:1, message: "success",items:consultants,imageBase:queryConfig.imageBase});


}




const Instituion = require('../models/institute.model');

const Courses = require('../models/instituteCourses.model');

ObjectId = require('mongodb').ObjectID;
var config = require('../../config/app.config.js');

const usersConfig = config.users;
const classConfig = config.class;

exports.createInstitution = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
  
  
    var file = req.file;
  
    var errors = [];
  
    //console.log("parameters => ", params)
  
    if (!req.body.location) {
      errors.push({
        field: "location",
        message: "location cannot be empty"
      })
    }
    if (!file) {
      errors.push({
        field: "image",
        message: "Please select a  image"
      })
    }
    if (!req.body.phone) {
      errors.push({
        field: "phone",
        message: "phone cannot be empty"
      })
    }
    if (!req.body.courses) {
      errors.push({
        field: "courses",
        message: "courses cannot be empty"
      })
    }
    else if(req.body.courses.length == 0) {
      errors.push({
        field: "courses",
        message: "add atleast one course",
      })
    }
    if (!req.body.name) {
      errors.push({
        field: "name",
        message: "name cannot be empty"
      })
    }
    if (!req.body.email) {
      errors.push({
        field: "email",
        message: "email cannot be empty"
      })
    }
    if (!req.body.description) {
      errors.push({
        field: "description",
        message: "description cannot be empty"
      })
    }
  
  
    if (errors.length > 0) {
  
      return res.status(200).send({
        success: 0,
        errors: errors,
  
        code: 200
      });
    }
    var params = req.body;
    
    var institutionObj = {};
    institutionObj.userId = userId;
    institutionObj.phone = params.phone;
    institutionObj.location = params.location;
    institutionObj.name = params.name;
    institutionObj.email = params.email;
    if (file.image && file.image.length > 0) {
      institutionObj.image = file.image[0].filename;
    }
  
    institutionObj.description = params.description;
    institutionObj.instituteCourse = params.courses;
    institutionObj.isApproved = false;
    institutionObj.isRejected = false;
    institutionObj.status = 1;
    institutionObj.tsCreatedAt = Date.now();
    institutionObj.tsModifiedAt = null;
    //rakesh 
  
    var newInstituion = new Instituion(institutionObj);
    var response = await newInstituion.save()
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while saving online class',
          error: err
        }
      })
    if (response && (response.success !== undefined) && (response.success === 0)) {
      return res.send(response);
    }
    return res.send({
      success: 1,
     
      message: 'Created a institution..waiting for admin approval',
    })
  
  }

  
exports.getCources = async (req, res) => {

  

  var courses = await Courses.find({ status: 1},{name:1}).catch(err => {
    return { success: 0,message:"something went wrong", error: err.message}
  })

  if (courses && courses.success != undefined && courses.success === 0){

    return res.send(courses)
  }

  return res.send({ 
    success: 1,
    message:"listed successfully",
    items:courses
  })

}

exports.listInstitutesAtHome = async(req,res) => {

  

  

  var pageParams = {
    skip: 0,
    limit: 5
  };

  var inst_list = await Instituion.find({status:1},{name:1,image:1,location:1,email:1,phone:1},pageParams).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err
    }
  })

  var inst_list_popular = await Instituion.find({status:1,isPopular:true},{name:1,image:1,location:1},pageParams).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err
    }
  })

  if (inst_list && (inst_list.success !== undefined) && (inst_list.success === 0)) {
    return res.send(inst_list);
  }
  if (inst_list_popular && (inst_list_popular.success !== undefined) && (inst_list_popular.success === 0)) {
    return res.send(inst_list_popular);
  }

  

  var ret_Obj = {};
  ret_Obj.success = 1;
  ret_Obj.imageBase =  classConfig.imageBase;
  ret_Obj.message = "listed Successfully"
  ret_Obj.insitutes = inst_list;
  ret_Obj.popularInstitutes = inst_list_popular;
 
  return res.send(ret_Obj);

}

exports.homeSeeMore = async(req,res) => {

  

  var query = req.query;


  var page = Number(query.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(query.perPage) || classConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : classConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var pageParams = {
    skip: offset,
    limit: perPage
  };

  var filter = {}

  filter.status = 1;
 
  if (query){
  
    if (query.isPopular == true || query.isPopular == 'true') {
      console.log(query)
      filter.isPopular = true;
    }
  }

 console.log(filter)
  

  var projection = {name:1,image:1,location:1,email:1,phone:1};
  
  

 
  var inst_list = await Instituion.find(filter,projection,pageParams).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err
    }
  })

  

  if (inst_list && (inst_list.success !== undefined) && (inst_list.success === 0)) {
    return res.send(inst_list);
  }
  
  var dataCount = await Instituion.countDocuments(filter).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err.message
    }
  })
  if (dataCount && (dataCount.success !== undefined) && (dataCount.success === 0)) {
    return res.send(dataCount);
  }

  var totalPages = dataCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
      page: page,
      perPage: perPage,
      hasNextPage: hasNextPage,
      totalItems: dataCount,
      totalPages: totalPages
  }

  var ret_Obj = {};
  ret_Obj.success = 1;
  ret_Obj.imageBase =  classConfig.imageBase;
  ret_Obj.message = "listed Successfully"
  ret_Obj.insitutes = inst_list;

  ret_Obj.pagination = pagination;
  return res.send(ret_Obj);


}

exports.detailInstitution = async (req, res) => {


  var userData = req.identity.data;
  var userId = userData.userId;

  var id = req.params.id;


  var detail = await (await Instituion.findOne({status:1,_id:id},{tsCreatedAt:0,tsModifiedAt:0,status:0})).populate({path:'instituteCourse',select:{'name':1}}).catch(err => {
    return {success:0,err:err.message,message:"could not fetch data"};
  })
  if (detail && (detail.success !== undefined) && (detail.success === 0)) {
    return res.send(detail);
  }

  var isOwner = 0;
  if (detail.userId == userId){
    isOwner = 1;
  }

  

  



  var ret_Obj = {};
  ret_Obj.success = 1;
  ret_Obj.message = "fetched data successfully";
  ret_Obj.imageBase =  classConfig.imageBase;
  ret_Obj.detail = detail;
  ret_Obj.isOwner = isOwner;
 
  return res.send(ret_Obj);

}
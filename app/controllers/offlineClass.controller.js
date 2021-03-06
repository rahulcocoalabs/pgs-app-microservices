

const institutionUpdateRequest = require('../models/instituteUpdateRequest.model');
const Instituion = require('../models/institute.model');
const enquiry = require('../models/instituteEnquiry.model');
const Courses = require('../models/instituteCourses.model');
const Keywords = require('../models/keyword.model');
ObjectId = require('mongodb').ObjectID;
var config = require('../../config/app.config.js');

const usersConfig = config.users;
const classConfig = config.offlineclass;

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
    if (file) {
      institutionObj.image = file.filename;
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
      item:response,
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
  var arr = [];

  for (x in courses) {
    let course = courses[x];
    let obj = {};
    obj.id = course._id;
    obj.name = course.name;
    arr.push(obj);
  }

  return res.send({ 
    success: 1,
    message:"listed successfully",
    items:arr
  })

}

exports.listInstitutesAtHome = async(req,res) => {

  

  

  var pageParams = {
    skip: 0,
    limit: 5
  };

  var filter = {};
  filter.status = 1;
  filter.isApproved = true;
  filter.toDate = { $gt: Date.now() };

  var inst_list = await Instituion.find(filter,{name:1,image:1,location:1,email:1,phone:1},pageParams).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err
    }
  })

  filter.isPopular = true;

  var inst_list_popular = await Instituion.find(filter,{name:1,image:1,location:1},pageParams).catch(err=>{
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

  filter.isApproved = true;
 
  if (query){
  
    if (query.isPopular == true || query.isPopular == 'true') {
      console.log(query)
      filter.isPopular = true;
    }
    if (query.location) {
      
      filter.location = query.location;
    }
    
    if (query.course) {
      
      filter.instituteCourse = query.course;
    }
  }

 
  

  var projection = {name:1,image:1,location:1,email:1,phone:1};
  
  filter.toDate = {$gt: Date.now()};

 
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


  var detail = await Instituion.findOne({status:1,_id:id},{tsCreatedAt:0,tsModifiedAt:0,status:0}).populate({path:'instituteCourse',select:'name'}).catch(err => {
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

exports.addEnquiry = async (req, res) => {

  var params = req.body;
  var  data = req.identity.data;
  var userId = data.userId;

  var errors = [];

  if (!params.comment) {
    errors.push({
      field: "comment",
      message: "comment cannot be empty"
    })
  }
  if (!params.institute) {
    errors.push({
      field: "institute",
      message: "institute cannot be empty"
    })
  }


  if (errors.length > 0) {

    return res.status(200).send({
      success: 0,
      errors: errors,

      code: 200
    });
  }

  var obj = {
    userId : userId,
    instituteId: params.institute,
   
    status: 1,
    comment:params.comment,
    name:params.name,
    email:params.email,
    phone:params.phone,
    tsCreatedAt: Date.now(),
    tsModifiedAt: null
  }

  var enquiryObj = new enquiry(obj);
  var saveData = await enquiryObj.save();

  if(saveData) {
    return res.send({
      success:1,
      message:"send successfully"
    })
  }


}

exports.listEnquiry = async(req,res)=>{
  var id = req.params.id;
  var  data = req.identity.data;
  var userId = data.userId;
  

  var inst = await Instituion.findOne({_id:id,status:1},{userId:1}).catch(err=>{
    return {succes:0,message:"something went wrong",error:err.message};
  });

  if(inst && (inst.success !== undefined) && (inst.success === 0)){

    return res.send(inst);
  }

  if (inst){
    if (inst.userId != userId){
      return res.send({ 
        success:0,
        message:"only institute owner has this previlage"
      })
    }
  }
  else {
    return res.send({ 
      success:0,
      message:"only institute owner has this previlage"
    })
  }

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
 
  filter.instituteId = id;
  

  var projection = {comment:1,userId:1,name:1,phone:1,email:1,tsCreatedAt:1};
  
  

 
  var enq_list = await enquiry.find(filter,projection,pageParams).populate({path:'userId',select:{'firstName':1,"image":1}}).catch(err=>{
    return {
      success: 0,
      message: 'Something went wrong while listing institutes',
      error: err
    }
  })

  

  if (enq_list && (enq_list.success !== undefined) && (enq_list.success === 0)) {
    return res.send(enq_list);
  }

  var arr = [];

  for (x in enq_list) {

    var enq = enq_list[x];
    var obj = {};
    obj.comment = enq.comment;
    obj.name = enq.name;
    obj.userId = enq.userId;
    obj.phone = enq.phone;
    obj.email = enq.email;
    obj.date = convert(enq.tsCreatedAt)
    arr.push(obj);
  }
  
  var dataCount = await enquiry.countDocuments(filter).catch(err=>{
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
  ret_Obj.imageBase =  usersConfig.imageBase;
  ret_Obj.message = "listed Successfully"
  ret_Obj.insitutes = arr;

  ret_Obj.pagination = pagination;
  return res.send(ret_Obj);
}

function convert(timestamp) {
  var date = new Date(                          // Convert to date
    parseInt(                                   // Convert to integer
      timestamp                 // Take only the part right of the "("
    )
  );
  return [
    ("0" + date.getDate()).slice(-2),           // Get day and pad it with zeroes
    ("0" + (date.getMonth()+1)).slice(-2),      // Get month and pad it with zeroes
    date.getFullYear()                          // Get full year
  ].join('/');                                  // Glue the pieces together
}

exports.editInstitution = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
  
  
    var file = req.file;
  
   
  
    
    var params = req.body;

    var update = {};

    if (params.courses){
      update.instituteCourse = params.courses;
    }
    if (params.name){
      update.name = params.name;
    }
    if (params.location){
      update.location = params.location;
    }
    if (params.phone){
      update.phone = params.phone;
    }
    if (params.email){
      update.email = params.email;
    }
    if (params.description){
      update.description = params.description;
    }
    if (file){
      update.image =file.filename;
    }
    
    
  
    var filter = {};
    filter.status = 1;
    filter._id = req.params.id;

    var response = await Instituion.updateOne(filter,update).catch(err => {
      return { success: 0,message:"something went wrong",error:err.message}
    })

    if (response && response.success != undefined && response.success ===0){
      return res.send(response)
    }

    return res.send({
      success: 1,
     
      message: 'updated institution details',
    })
  
  }

  exports.removeAll = async (req, res) => {

    var update = await Instituion.updateMany({},{status:0});

    var update1 = await enquiry.updateMany({},{status:0});
    //var update2 = await Keywords.updateMany({},{status:0});

    return res.send("ok");
  }


  exports.createInstitutionUpdateRequest = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
  
  
    var file = req.file;
  
   
    var params = req.body;

   
    var institutionObj = {};
    institutionObj.userId = userId;
    institutionObj.phone = params.phone;
    institutionObj.location = params.location;
    institutionObj.name = params.name;
    institutionObj.email = params.email;
    if (file) {
      institutionObj.image = file.filename;
    }
    institutionObj.institution = req.params.id;
    institutionObj.description = params.description;
    institutionObj.instituteCourse = params.courses;
    institutionObj.isApproved = false;
    institutionObj.isRejected = false;
    institutionObj.status = 1;
    institutionObj.tsCreatedAt = Date.now();
    institutionObj.tsModifiedAt = null;
    //rakesh 
  
    var newInstituion = new institutionUpdateRequest(institutionObj);
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
     
      message: 'send a request..waiting for admin approval',
    })
  
  }

  exports.myInstitutes = async (req, res) => {

    const userData = req.identity.data;
    const userId = userData.userId;

    const list = await Instituion.find({userId: userId,status:1}).catch(err => {
      return { success: 0,message:err.message}
    })

    if (list.success && list.success !== undefined && list.success === 0 ) {
      return res.send(list)
    }

    return res.send({
      success:1,
      items:list,
      imageBase:classConfig.imageBase
    })
  }
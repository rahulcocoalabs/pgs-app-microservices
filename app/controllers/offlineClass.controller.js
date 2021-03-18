


const Instituion = require('../models/institute.model');

const Courses = require('../models/instituteCourses.model');

ObjectId = require('mongodb').ObjectID;




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
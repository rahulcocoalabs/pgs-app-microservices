exports.addAddress = async(req,res) =>{
    var Address = methods.loadModel('address');
    var userData = req.identity.data;
    var userId = userData.userId;
    var address_id = req.body.address_id;
    var address_1 = req.body.address;
    var postCode = req.body.postCode;
    var phoneNumber = req.body.phoneNumber;
    var firstname = req.body.firstname ? req.body.firstname : '';
    var lastname = req.body.lastname ? req.body.lastname : '';
    var company = req.body.company ? req.body.company : '';
    var address_2 = req.body.address_2 ? req.body.address_2 : '';
    var city = req.body.city ? req.body.city : '';
    var type = req.body.type;
    var landmark = req.body.landmark;
    var countryId = req.body.countryId;
    var stateId = req.body.stateId;
    var cityId = req.body.cityId;
    if (address_id) {
      if (!address_1 || !postCode || !phoneNumber || !landmark || !type) {
        errors = [];
        if (!address_1) {
          errors.push({
            field: "address",
            message: "Address cannot be empty"
          });
        }
        if (!postCode) {
          errors.push({
            field: "postCode",
            message: "postCode cannot be empty"
          });
        }
        if (!phoneNumber) {
          errors.push({
            field: "phoneNumber",
            message: "phoneNumber cannot be empty"
          });
        }
        if (!landmark) {
          errors.push({
            field: "landMark",
            message: "landMark cannot be empty"
          });
        }
        if (!phoneNumber) {
          errors.push({
            field: "phoneNumber",
            message: "phoneNumber cannot be empty"
          });
        }
        return res.send({
          success: 0,
          errors: errors,
          code: 200
        });
      }
      Address.update({
        address_1: address_1,
        postcode: postCode,
        mobile: phoneNumber,
        firstname: firstname,
        lastname: lastname,
        company: company,
        address_2: address_2,
        city: city,
        type: type,
        landmark: landmark,
        country_id: countryId,
        state_id: stateId,
        city_id: cityId
      }, {
        where: {
          address_id: address_id,
          customer_id: userId
        }
      }).then(() => {
        res.send({
          success: 1,
          message: "Address updated successfully"
        })
      });
    } else {
      if (!address_1 || !postCode || !phoneNumber || !landmark || !type) {
        errors = [];
        if (!address_1) {
          errors.push({
            field: "address",
            message: "Address cannot be empty"
          });
        }
        if (!postCode) {
          errors.push({
            field: "postCode",
            message: "postCode cannot be empty"
          });
        }
        if (!phoneNumber) {
          errors.push({
            field: "phoneNumber",
            message: "phoneNumber cannot be empty"
          });
        }
        if (!landmark) {
          errors.push({
            field: "landMark",
            message: "phoneNumber cannot be empty"
          });
        }
        if (!type) {
          errors.push({
            field: "type",
            message: "type cannot be empty"
          });
        }
        return res.send({
          success: 0,
          errors: errors,
          code: 200
        });
      }

      Address.create({
        address_1: address_1,
        postcode: postCode,
        mobile: phoneNumber,
        firstname: firstname,
        lastname: lastname,
        company: company,
        address_2: address_2,
        city: city,
        type: type,
        landmark: landmark,
        country_id: countryId,
        state_id: stateId,
        city_id: cityId,
        customer_id: userId,
        status: 1

      }).then(result => {
        res.send({
          success: 1,
          message: "Address successfully added"
        })
      }).catch(err => {
        res.send({
          success: 0,
          message: err.message || "Some error occurred while adding address."
        })
      })
    }


  }
  exports.deleteAddress = async(req,res) =>{

    var Address = methods.loadModel('address');
    var userData = req.identity.data;
    var userId = userData.userId;
    var address_id = req.body.address_id;
    if (!address_id) {
      res.send({
        success: 0,
        message: "Address ID should not be empty"
      })
    }
    Address.update({
      status: 0
    }, {
      where: {
        address_id: address_id,
        customer_id: userId
      }
    }).then(() => {
      res.send({
        success: 1,
        message: "Address deleted successfully"
      })
    }).catch(err => {
      res.send({
        success: 0,
        message: err.message || "Some error occurred while deleting address."
      })
    })
  };

  exports.listAddress = async(req,res) =>{
    var Address = methods.loadModel('address'); 
    var userData = req.identity.data;
    var userId = userData.userId;
    Address.findAll({
      where: {
        customer_id: userId,
        status: 1
      }
    }).then((addressData) => {
      res.send({
        success: 1,
        items: addressData,
        message: 'Address listed successfully'
      })
    }).catch(err => {
      res.send({
        success: 0,
        message: err.message || "Some error occurred while fetching address list"
      })
    })
  };

  exports.listCountries = async(req,res) =>{
    var Countries = require('../models/country.model.js');
    Countries.find().then(coutriesData => {
      res.send({
        success: 1,
        items: coutriesData,
        message: 'Countries listed successfully'
      })
    }).catch(err => {
        res.send({
          success: 0,
          message: err.message || "Some error occurred while fetching countries list."
        })
      })
  };
  exports.listStates = async(req,res) =>{
    var States = require('../models/state.model.js');
    var countryId = req.params.countryId;
    var finCriteria = {
      countryId: countryId
    };
    States.find(finCriteria).then(statesData => {
      res.send({
        success: 1,
        items: statesData,
        message: 'States list fetched successfully'
      })
    }).catch(err => {
      res.send({
        success: 0,
        message: err.message || "Some error occurred while fetching states list."
      })
    })
  };
  exports.listCities = async(req,res) =>{
    var Cities = require('../models/city.model.js');
    var stateId = req.params.stateId;
    var finCriteria = {
      stateId: stateId
    };
    Cities.find(finCriteria).then(citiesData => {
      res.send({
        success: 1,
        items: citiesData,
        message: 'Cities listed successfully'
      })
    }).catch(err => {
        res.send({
          success: 0,
          message: err.message || "Some error occurred while fetching cities list."
        })
      })
  };





const Enquiry = require('../models/enquiry.model.js');

  this.listAll = (req, res) => {
    console.log("listAll() working...");
  };

  exports.add = async (req,res) => {

    var params = req.body;
    var userData = req.identity.data;
    var userId = userData.userId;

    if (!params.message){
      return res.send({
        success:0,
        message:"please add some message"
      })
    }
    var userData = await userId.findOne({_id:userId,status:1})

    var msg = new Enquiry({
      email:userData.email,
      phone:userData.mobile,
      message:params.message,

    })

    var saved = await msg.save();

    return res.send({
      success:1,
      message:"recieved message"
    })
  }


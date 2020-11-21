const Contact = require('../models/contact.model.js');
var moment = require('moment');

  exports.sendContact = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.userId;
    if (!req.body.message) {
      return res.send({
        field: "message",
        message: "message cannot be empty"
      });
    }
    const newContact = new Contact({
      userId: userId,
      message: req.body.message,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });
    newContact.save()
      .then(data => {
        var formattedData = {
          success: 1,
          message: "Contact submitted"
        };
        res.send(formattedData);
      }).catch(err => {
        res.status(500).send({
          success: 0,
          status: 500,
          message: err.message || "Some error occurred while submitting contact."
        });
      });
  }

const TheatreSeatBooking = require('../models/theatreSeatBooking.model.js');

function theatreSeatBookingController(methods, options) {
  this.listAll = (req, res) => {
    console.log("listAll() working...");
  };
};
module.exports = theatreSeatBookingController;

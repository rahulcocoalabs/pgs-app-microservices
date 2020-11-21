const TheatreSeatType = require('../models/theatreSeatType.model.js');

function theatreSeatTypeController(methods, options) {
  this.listAll = (req, res) => {
    console.log("listAll() working...");
  };
};

module.exports = theatreSeatTypeController;

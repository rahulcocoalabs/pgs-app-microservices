module.exports = (app) => {
    const enquiry = require('../controllers/enquiry.controller.js');
    app.get('/enquiries', enquiry.listAll);
   
}
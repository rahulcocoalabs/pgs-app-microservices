module.exports = (app) => {
    const testResult = require('../controllers/testResult.controller.js');
    app.get('/tests/results', testResult.listAll);
   
}
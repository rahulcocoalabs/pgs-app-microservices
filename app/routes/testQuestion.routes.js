module.exports = (app) => {
    const testQuestion = require('../controllers/testQuestion.controller.js');
    app.get('/tests/questions', testQuestion.listAll);
   
}
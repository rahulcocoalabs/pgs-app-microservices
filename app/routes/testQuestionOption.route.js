module.exports = (app) => {
    const testQuestionOption = require('../controllers/testQuestionOptions.controller.js');
    app.get('/tests/questionOptions', testQuestionOption.listAll);
   
}
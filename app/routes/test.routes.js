
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const tests = require('../controllers/tests.controller');
    app.get('/tests',auth, tests.listAllTests);
    app.get('/tests/summary',auth, tests.getSummary);
    app.get('/tests/summary/v2',auth, tests.getSummaryForWeb);
    app.get('/tests/detail/:id',auth, tests.getTestDetail);
    app.get('/tests/detail/:id/questions',auth, tests.getQuestions);
    app.post('/tests/detail/:id/answers',auth, tests.saveTestResult);
    app.get('/tests/attended/list',auth, tests.listAttendedTests);
    app.get('/tests/:id/attended/details',auth, tests.detailsAttendedTests);
    app.patch('/tests/detail/:id/answers',auth,tests.updateTestResult);
}

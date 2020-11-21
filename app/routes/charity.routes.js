const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const charities = require('../controllers/charities.controller');
    app.get('/charities',auth,charities.listAll);
    app.get('/charities/detail/:id',auth,charities.getCharityDetail);
    app.get('/charities/summary',auth,charities.getSummary);
    app.get('/charities/summary/v2',auth,charities.getSummaryForWeb);
    app.post('/charities/detail/coins/:id',auth,charities.donateCoins);
}
const auth = require('../middleware/auth.js');
module.exports = (app,methods,options) => {
    const ads = require('../controllers/ads.controller')
    app.get('/ads',auth,ads.getAds);
}
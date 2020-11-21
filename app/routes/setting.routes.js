module.exports = (app) => {
    const setting = require('../controllers/setting.controller.js');
    app.get('/settings', setting.listAll);
   
}
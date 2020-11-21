module.exports = (app) => {
    const tag = require('../controllers/tag.controller.js');
    app.get('/tags', tag.listAll);
   
}
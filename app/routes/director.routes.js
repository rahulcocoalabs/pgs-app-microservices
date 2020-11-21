module.exports = (app) => {
    const director = require('../controllers/director.controller.js');
    app.get('/movies/directors', director.listAll);
   
}
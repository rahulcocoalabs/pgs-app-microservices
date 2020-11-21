module.exports = (app) => {
    const quote = require('../controllers/quote.controller.js');
    app.get('/quotes', quote.listAll);
   
}
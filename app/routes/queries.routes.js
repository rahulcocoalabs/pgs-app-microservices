
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const query = require('../controllers/queries.controller');
    
    app.get('/queries/get-categories',auth, query.getCategories);
    
   
}

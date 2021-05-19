
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const query = require('../controllers/queries.controller');
    
    app.get('/queries/get-categories',auth, query.getCategories);
    app.get('/queries/get-consultants/:id',auth, query.getConsultants);
    app.post('/queries/post-query/:id',auth, query.postQuery);
    app.patch('/queries/post-answer/:id',auth, query.addAnswer);
    app.patch('/queries/list-queries/:id',auth, query.listQueries);
}

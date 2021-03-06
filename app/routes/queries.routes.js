
const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const query = require('../controllers/queries.controller');
    
    app.get('/queries/get-categories',auth, query.getCategories);
    app.get('/queries/get-consultants/:id',auth, query.getConsultants);
    app.post('/queries/post-query/:id',auth, query.postQuery);
    app.patch('/queries/post-answer/:id', query.addAnswer);
    app.get('/queries/show-query/:id', query.showQuery);
    app.get('/queries/list-chat/:id',auth, query.listChat);
    app.get('/queries/history/',auth, query.listHistory);
    app.get('/queries/consultant-details/:id',auth, query.consultantDetails);
}

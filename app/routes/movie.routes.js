const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const movies = require('../controllers/movies.controller');
    app.get('/movies',auth,movies.all);
    app.get('/movies/detail/:id',auth,movies.details);
    app.get('/movies/actors/detail/:id',auth,movies.getActorDetail);
    app.get('/movies/actors',auth,movies.listActors);
    app.get('/movies/industries',auth,movies.listIndustries);
    app.get('/movies/categories',auth,movies.listCategories);
};

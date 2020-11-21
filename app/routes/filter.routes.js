module.exports = (app) => {
    const filters = require('../controllers/filters.controller');
    app.get('/filters',filters.listAll);
}
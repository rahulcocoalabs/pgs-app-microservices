const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const games = require('../controllers/games.controller');
    app.get('/games',auth, games.listAllGames);
    app.patch('/games/download',auth, games.didClickDownloadButton);
    app.get('/games/detail/:id',auth,games.getGameDetail);
    app.get('/games/summary',auth,games.getSummary);
    app.get('/games/summary/v2',auth,games.getSummaryForWeb);
    app.get('/games/categories',auth,games.listAllCategories);
    app.get('/games/categories/:id',auth,games.getGameCategoryDetail);
};
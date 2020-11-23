const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouritesTutors.controller');
    app.get('/favouritestutors',auth, favourites.getUserFavourites);
    app.post('/favouritetutor/addtutor',auth,favourites.addfavourite);
    app.delete('/removetutor',auth,favourites.removeFav);
}

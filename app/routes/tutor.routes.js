const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouritesTutor.controller');
    app.get('/favourites',auth, favourites.getUserFavourites);
    app.post('/favourites',auth,favourites.addfavourite);
    app.delete('/favourites',auth,favourites.removeFav);
}

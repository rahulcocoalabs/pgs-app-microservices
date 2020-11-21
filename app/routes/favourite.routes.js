const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favourites.controller');
    app.get('/favourites',auth, favourites.getUserFavourites);
    app.post('/favourites',auth,favourites.addFav);
    app.delete('/favourites',auth,favourites.removeFav);
}

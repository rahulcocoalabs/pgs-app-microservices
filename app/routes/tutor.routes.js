const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouriteTutor.controller');
    app.get('/favourites',auth, favourites.getUserFavourites);
    app.post('/favourites',auth,favourites.addfavourite);
    app.delete('/favourites',auth,favourites.removeFav);
}

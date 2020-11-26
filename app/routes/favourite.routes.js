const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favourites.controller');
    app.get('/favourites', auth, favourites.getUserFavourites);
    app.post('/favourites', auth, favourites.addFav);
    app.delete('/favourites', auth, favourites.removeFav);
    const favourites = require('../controllers/favouriteTutor.controller');
    //  app.get('/favourites',auth, favourites.getUserFavourites);
    app.post('/favourites/tutoradd', auth, favourites.addfavourite);
    app.post('/favourites/classadd', auth, favourites.addfavouriteClass);
    app.delete('/favourites/tutordelete', auth, favourites.removefavourite);
    app.delete('/favourites/classdelete', auth, favourites.removefavouriteClass);
}

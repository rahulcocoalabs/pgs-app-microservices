const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favourites.controller');
    app.get('/favourites', auth, favourites.getUserFavourites);
    app.post('/favourites', auth, favourites.addFav);
    app.delete('/favourites', auth, favourites.removeFav);
    const favourites1 = require('../controllers/favouriteTutor.controller');
    //  app.get('/favourites',auth, favourites.getUserFavourites);
    app.post('/favourites/tutoradd', auth, favourites1.addfavourite);
    app.post('/favourites/classadd', auth, favourites1.addfavouriteClass);
    app.delete('/favourites/tutordelete', auth, favourites1.removefavourite);
    app.delete('/favourites/classdelete', auth, favourites1.removefavouriteClass);
}

const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouriteTutor.controller');
  //  app.get('/favourites',auth, favourites.getUserFavourites);
    app.post('/tutor/tutoradd',auth,favourites.addfavourite);
    app.delete('/tutor/tutordelete/:id',auth,favourites.removefavourite);
}

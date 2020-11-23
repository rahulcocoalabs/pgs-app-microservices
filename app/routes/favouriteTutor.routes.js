const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouritesTutors.controller');
   
    app.post('/favouriteTutor/addtutor',auth,favourites.addfavourite);
   
}

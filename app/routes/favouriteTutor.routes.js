const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouritesTutor.controller');
   
    app.post('/favouriteTutor/addtutor',auth,favourites.addfavourite);
   
}

const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const favourites = require('../controllers/favouriteTutor.controller');
   
    app.post('/favouritetutor',auth,favourites.addfavourite);
   
}

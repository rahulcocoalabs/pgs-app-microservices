const auth = require('../middleware/auth.js');
const favouriteTutorModel = require('../models/favouriteTutor.model.js');
function tutor(req,res){
    return res.send("ok")
}
module.exports = (app) => {
   // const store = require('../controllers/store.controller');

    app.post('/tutor',auth, tutor);
    
    //store autocomplete
   
}
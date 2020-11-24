const auth = require('../middleware/auth.js');
const favouriteTutorModel = require('../models/favouriteTutor.model.js');
function tutor(req,res){
    console.log('54');
    return res.send("ok")
}
module.exports = (app) => {
   // const store = require('../controllers/store.controller');
    console.log('test44');
    app.post('/tutor', tutor);
    
    //store autocomplete
   
}
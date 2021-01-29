const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const alumni = require('../controllers/alumni.controller');

   app.post('/alumni/add',auth,alumni.addAlumni);
  
}
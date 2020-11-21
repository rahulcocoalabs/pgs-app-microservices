const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const contacts = require('../controllers/contact.controller');
    app.post('/contact',auth, contacts.sendContact);
}


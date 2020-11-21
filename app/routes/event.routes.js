const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const events = require('../controllers/events.controller');
    app.get('/events',auth,events.listAll);
    app.get('/events/detail/:id',auth,events.getDetail);
    app.post('/events/eventbookings',auth,events.sendEventBooking);
    app.get('/events/history',auth,events.listEventHistory);
}
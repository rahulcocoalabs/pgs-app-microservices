const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const events = require('../controllers/events.controller');
    app.get('/events',auth,events.listAll);
    app.patch('/events/add-interest/:id',auth,events.addInterest);
    app.get('/events/detail/:id',auth,events.getDetail);
    app.post('/events/eventbookings',auth,events.sendEventBooking);
    app.get('/events/history',auth,events.listEventHistory);
    app.patch('/events/:id/participate',auth,events.participateEvent);
    app.get('/events/:id/link', auth,events.getEventLink);
    app.get('/events/scholarship-placement/list', auth,events.getEventScholarshipPlacementList);
    app.get('/events/scholarship-placement/:id/detail', auth,events.getEventScholarshipPlacementDetail);
}
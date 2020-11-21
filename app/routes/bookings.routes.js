const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const bookings = require('../controllers/bookings.controller');
    app.get('/bookings/summary',auth, bookings.getSummary);
    app.get('/bookings/movie/:id',auth,bookings.getMovieDetail);
    app.get('/bookings/summary/v2',auth,bookings.getSummaryForWeb);
    app.get('/bookings/movies',auth,bookings.getMoviesList);
    app.get('/bookings/running',auth,bookings.getRunningMovies);
    app.get('/bookings/events',auth,bookings.getEventsList);
}

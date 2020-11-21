
module.exports = (app,methods,options) => {
    const theatres = methods.loadController('theatres',options);
    theatres.methods.get('', theatres.theatreList,{auth : false});
    // app.get('/theatres/:theatre_id/screens/:screen_id/seats/availablility',theatre.seatAvailability);
    theatres.methods.post('seats/availablility',theatres.seatAvailability,{auth : false});
    // app.post('/theatres/:theatre_id/screens/:screen_id/seats/lock',theatre.seatLock);
    theatres.methods.post('seats/lock',theatres.seatLock,{auth : false});
    // app.post('/theatres/:theare_id/screens/:screen_id/movie/:movie_id/book',theatre.bookMovie);
    theatres.methods.post('book',theatres.bookMovie,{auth : false});

}
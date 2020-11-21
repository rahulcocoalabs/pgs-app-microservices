const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const notifications = require('../controllers/notifications.controller');
    app.get('/notifications',auth, notifications.listAll);
    app.post('/notifications/:id/markas-read',auth,notifications.markAsRead);
    app.get('/notifications/count',auth,notifications.countUnread)
}




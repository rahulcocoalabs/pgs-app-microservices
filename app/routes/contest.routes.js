const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const contests = require('../controllers/contests.controller');
    app.get('/contest', contests.listAll);
    app.get('/contest/:id/detail', auth,contests.detail);
    app.get('/contest/contest-history',auth, contests.listContestHistory);
    app.get('/contest/result-announced',auth, contests.listResultAnnouncedContest);
    app.get('/contest/:id/leader-board',auth, contests.getLeaderBoard);
}
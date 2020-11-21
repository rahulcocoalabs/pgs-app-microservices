const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const masters = require('../controllers/masters.controller');
    app.get('/masters/genders',masters.getGenders);
    app.get('/masters/syllabuses',masters.getSyllabuses);
    app.get('/masters/schools',masters.getSchools);
    app.get('/masters/professions',masters.getProfessions);
    app.get('/masters/nationalities',masters.getNationalities);
    app.get('/masters/languages',masters.getLanguages);
    app.get('/masters/hobbies',masters.getHobbies);
    app.get('/masters/registration',masters.getRegisterMasters);
    app.get('/masters/search',masters.searchKeywords);
    app.get('/masters/search/default',masters.defaultSearch);
    app.get('/masters/filters',masters.getFilters);

    //Tutor masters
    app.get('/masters/tutor/courses',masters.getCources);
    app.get('/masters/tutor/categories',masters.getCategories);
    app.get('/masters/tutor/subjects',auth,masters.getSubjects);
    app.get('/masters/tutor/classes',auth,masters.getClasses);

}
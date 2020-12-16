const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const address = require('../controllers/address.controller');

   app.post('/add-address',auth,address.addAddress);
   app.delete('/delete-address',auth,address.deleteAddress);
   app.get('/list-address',auth,address.listAddress);
   app.get('/list-countries',auth,address.listCountries);
   app.get('/list-states/:countryId',auth,address.listStates);
   app.get('/list-cities/:stateId',authaddress.listCities);
}
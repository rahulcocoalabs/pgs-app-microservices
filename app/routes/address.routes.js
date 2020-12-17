const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const address = require('../controllers/address.controller');

   app.post('/address/add-address',auth,address.addAddress);
   app.delete('/address/delete-address',auth,address.deleteAddress);
   app.get('/address/list-address',auth,address.listAddress);
   app.get('/address/list-countries',auth,address.listCountries);
   app.get('/address/list-states/:countryId',auth,address.listStates);
   app.get('/address/list-cities/:stateId',address.listCities);
}
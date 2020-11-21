module.exports = (app,methods,options) => {
    const address = methods.loadController('address',options); 
    
    address.methods.post('/add-address',address.addAddress,{auth:true});
    address.methods.delete('/delete-address',address.deleteAddress,{auth:true});
    address.methods.get('/list-address',address.listAddress,{auth:true});
    address.methods.get('/list-countries',address.listCountries,{auth:true});
    address.methods.get('/list-states/:countryId',address.listStates,{auth:true});
    address.methods.get('/list-cities/:stateId',address.listCities,{auth:true});

}
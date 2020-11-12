module.exports = function (app) {
   var Controller = require('./../controllers/customers.controller');

   app.post('/API/customerManagement/customerReference_AsyncValidate/', Controller.customerReference_AsyncValidate);
   app.post('/API/customerManagement/customerEmail_AsyncValidate/', Controller.customerEmail_AsyncValidate);
   app.post('/API/customerManagement/customer_registration/', Controller.customer_registration);
   app.post('/API/customerManagement/customer_login/', Controller.customer_login);
   app.post('/API/customerManagement/customerDetails/', Controller.customerDetails);
   app.post('/API/customerManagement/referralsList/', Controller.referralsList);

};
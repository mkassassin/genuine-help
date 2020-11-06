module.exports = function (app) {
   var Controller = require('./../controllers/help.controller');

   app.post('/API/helpManagement/getHelpRequest_Create/', Controller.getHelpRequest_Create);
   app.post('/API/helpManagement/Available_GetHelpRequestsList/', Controller.Available_GetHelpRequestsList);
   app.post('/API/helpManagement/provideHelpRequest_Create/', Controller.provideHelpRequest_Create);
   app.post('/API/helpManagement/provideHelpRequest_toMe/', Controller.provideHelpRequest_toMe);
   app.post('/API/helpManagement/provideHelpRequest_Accept/', Controller.provideHelpRequest_Accept);
   app.post('/API/helpManagement/getHelpRequest_toMe/', Controller.getHelpRequest_toMe);
   app.post('/API/helpManagement/provideHelp_PaymentProofUpdate/', Controller.provideHelp_PaymentProofUpdate);
   app.post('/API/helpManagement/provideHelpRequest_PaymentAccept/', Controller.provideHelpRequest_PaymentAccept);

};
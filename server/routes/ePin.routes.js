module.exports = function (app) {
   var Controller = require('./../controllers/ePin.controller');

   app.post('/API/ePinManagement/ePins_create/', Controller.ePins_create);
};
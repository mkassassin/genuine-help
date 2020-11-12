var ePinModel = require('../models/ePin.model');
var ErrorHandling = require('./../handling/ErrorHandling').ErrorHandling;
var ObjectId = require('mongoose').Types.ObjectId;
var randomstring = require("randomstring");


// E-Pin Create ------------------------------------------ 
exports.ePins_create = function (req, res) {

   ePinModel.EPinManagementSchema.find({}, {}, {}, function (err, result) {
      if (err) {
         ErrorHandling.ErrorLogCreation(req, 'E-Pins list getting Error', 'ePin.Controller -> ePins_create', JSON.stringify(err));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while Find the E-Pins!.", Error: err });
      } else {

         const existingPins = [];
         if (result.length > 0) {
            result.map(obj => existingPins.push(obj.ePin));
         }
         const insertArr = [];
         const EPinArr = [];
         let mapArr = new Array(200).fill(undefined).map((val,idx) => idx + 1);

         const ePinGeneration = () => {
            return new Promise((resolve, reject) => {
               const newPin = randomstring.generate({ length: 7, charset: 'alphanumeric' });
               if (!existingPins.includes(newPin)) {
                  resolve(newPin);
               } else {
                  const validEPin = async () =>  await ePinGeneration();
                  resolve(validEPin);
               }
            });
         };

         const asyncMap =  mapArr.map(async (obj) => {
            const E_Pin = await ePinGeneration();
            EPinArr.push(E_Pin);
            const Create_ePin = new ePinModel.EPinManagementSchema({
               ePin: E_Pin,
               purchasedBy: null,
               UsedBy: null,
               purchasedDate: null,
               usedDate: null,
               ePinStatus: 'Created',
               Active_Status: true,
               If_Deleted: false
            });
            insertArr.push(Create_ePin);
         });
         Promise.all(asyncMap)
            .then(response => {
               ePinModel.EPinManagementSchema.insertMany(insertArr, (err_1, result_1) => {
                  if (err_1) {
                     ErrorHandling.ErrorLogCreation(req, 'E-Pins insert getting Error', 'ePin.Controller -> ePins_create', JSON.stringify(err));
                     res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while Creating the E-Pins!.", Error: err_1 });
                  } else {
                     res.status(200).send({ Status: true, Message: 'E-Pins Successfully Created', Response: result_1, EPinArr: EPinArr });
                  }
               });
            }).catch(error => {
               ErrorHandling.ErrorLogCreation(req, 'E-Pins insert getting Error', 'ePin.Controller -> ePins_create', JSON.stringify(err));
               res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while Creating the E-Pins!.", Error: err_1 });
            });
      }
   });
};
var ePinModel = require('../models/ePin.model');
var customersModel = require('../models/customers.model');
var ErrorHandling = require('./../handling/ErrorHandling').ErrorHandling;
var CryptoJS = require("crypto-js");
var crypto = require("crypto");
var parser = require('ua-parser-js');
var ObjectId = require('mongoose').Types.ObjectId;

// Customer Reference Async Validate -----------------------------------------------
exports.customerReference_AsyncValidate = function(req, res) {
   var receivingData = req.body;

   if(!receivingData.reference || receivingData.reference === '' || !ObjectId.isValid(receivingData.reference) ) {
      res.status(400).send({Status: false, Message: "Reference can not be empty" });
   }else {
      customersModel.CustomersManagementSchema.findOne({'_id': ObjectId(receivingData.reference), Active_Status: true, If_Deleted: false }, {}, {}, function(err, result) {
         if(err) {
            ErrorHandling.ErrorLogCreation(req, 'Customer Reference validate getting error', 'customers.Controller -> customerReference_AsyncValidate', JSON.stringify(err));
            res.status(417).send({Status: false, Message: "Some error occurred while validate the Reference!."});
         } else {
            if (result === null) {                
               res.status(200).send({Status: true, Available: false });
            } else {
               res.status(200).send({Status: true, Available: true });
            }
         }
      });
   }
};

// Customer E-mail Async Validate -----------------------------------------------
exports.customerEmail_AsyncValidate = function(req, res) {
   var receivingData = req.body;

   if(!receivingData.email || receivingData.email === '' ) {
      res.status(400).send({Status: false, Message: "E-mail can not be empty" });
   }else {
      customersModel.CustomersManagementSchema.findOne({'email': { $regex : new RegExp("^" + receivingData.email + "$", "i") } }, {}, {}, function(err, result) {
         if(err) {
            ErrorHandling.ErrorLogCreation(req, 'Customers E-mail validate getting error', 'customers.Controller -> customerEmail_AsyncValidate', JSON.stringify(err));
            res.status(417).send({Status: false, Message: "Some error occurred while validate the email!."});
         } else {
            if (result !== null) {                
               res.status(200).send({Status: true, Available: false });
            } else {
               res.status(200).send({Status: true, Available: true });
            }
         }
      });
   }
};


// Customer Create ------------------------------------------ 
exports.customer_registration = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.name || receivingData.name === '') {
      res.status(400).send({ Status: false, Message: "Name can not be empty" });
   } else if (!receivingData.email || receivingData.email === '') {
      res.status(400).send({ Status: false, Message: "E-mail can not be empty" });
   } else if (!receivingData.mobile || receivingData.mobile === '') {
      res.status(400).send({ Status: false, Message: "Mobile can not be empty" });
   } else if (!receivingData.ePin || receivingData.ePin === '') {
      res.status(400).send({ Status: false, Message: "E-Pin can not be empty" });
   } else if (!receivingData.password || receivingData.password === '') {
      res.status(400).send({ Status: false, Message: "Password can not be empty" });
   } else if (!receivingData.termsAgree || receivingData.termsAgree === '') {
      res.status(400).send({ Status: false, Message: "Terms Agree is be Required" });
   } else if (!receivingData.reference || receivingData.reference === '') {
      res.status(400).send({ Status: false, Message: "Reference can not be empty" });
   } else if ((!receivingData.accNum || !receivingData.ifscCode || !receivingData.branch || receivingData.accNum === '' || receivingData.ifscCode === '' || receivingData.branch === '') && (!receivingData.UPIid || receivingData.UPIid === '')) {
      res.status(400).send({ Status: false, Message: "Any one of Payment mode is be Required" });
   } else {
      Promise.all([
         ePinModel.EPinManagementSchema.findOne({ ePin: receivingData.ePin }).exec(), //$or: [{ePinStatus: 'Purchased'}, {ePinStatus: 'Used'}]
         customersModel.CustomersManagementSchema.findOne({}, {}, {'sort': {createdAt: -1}}).exec()
      ]).then( response => {
         var ePinData = response[0];
         var lastCustomer = response[1];
         var uniqueNumber = lastCustomer !== null ? (lastCustomer.uniqueNumber + 1) : 1;
         var uniqueCode = (uniqueNumber.toString()).padStart(7, 0);
         if (ePinData !== null && ePinData.ePinStatus !== 'Used') {
            receivingData.email = receivingData.email !== '' && receivingData.email !== null ? receivingData.email.toLowerCase() : ''; 
            const Create_Customer = new customersModel.CustomersManagementSchema({
               name: receivingData.name || '',
               uniqueCode: uniqueCode || '0000001',
               uniqueNumber: uniqueNumber || 1,
               email: receivingData.email || '',
               mobile: receivingData.mobile || '',
               whatsApp: receivingData.whatsApp || '',
               ePin: ePinData._id || null,
               password: receivingData.password || '',
               accNum: receivingData.accNum || '',
               ifscCode: receivingData.ifscCode || '',
               branch: receivingData.branch || '',
               UPIid: receivingData.UPIid || '',
               termsAgree: receivingData.termsAgree || true,
               referBy: receivingData.reference || null,
               currentLevel: 'Level_1',
               getHelpStatus: 'Pending',
               provideHelpStatus: 'Open',
               getHelpCompletionDate: null,
               provideCompletionDate: null,
               lastLevelCompletionDate: null,
               Active_Status: true,
               If_Deleted: false,
            });
            Create_Customer.save( (err, result) => {
               if (err) {
                  ErrorHandling.ErrorLogCreation(req, 'Customers registration getting Error', 'customers.Controller -> customer_registration', JSON.stringify(err));
                  res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while register the customer!.", Error: err });
               } else {
                  ePinModel.EPinManagementSchema.updateOne({_id: ePinData._id}, {$set: {UsedBy: result._id, usedDate: new Date()}}).exec();
                  res.status(200).send({ Status: true, Message: 'Registration Successfully Completed', Response: result });
               }
            });
         } else {
            if (ePinData !== null && ePinData.ePinStatus === 'Used') {
               res.status(400).send({ Status: false, Message: "The E-Pin is Already Used" }); 
            } else {
               res.status(400).send({ Status: false, Message: "The E-Pin is Invalid" }); 
            }
         }
      }).catch( error => {
         ErrorHandling.ErrorLogCreation(req, 'Customers verification getting Error', 'customers.Controller -> customer_registration', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while validate the customer!.", Error: error });
      });
   }
};


// Customer Login
exports.customer_login = function (req, res) {        
   var receivingData = req.body;
   var today = new Date();
   today.setHours(today.getHours() - 2);
   customersModel.LoginHistorySchema.updateMany( { LastActive : { $lte: today }, Active_Status: true, If_Deleted: false }, { $set: { Active_Status: false } } ).exec();

   if (!receivingData.email || receivingData.email === '') {
      res.status(400).send({ Status: false, Message: "E-mail can not be empty" });
   } else if (!receivingData.password || receivingData.password === '') {
      res.status(400).send({ Status: false, Message: "Password can not be empty" });
   } else {
      customersModel.CustomersManagementSchema
      .findOne({
         'email': { $regex: new RegExp("^" + receivingData.email + "$", "i") },
         'password': receivingData.password,
         'Active_Status': true,
         'If_Deleted': false
      }, { Password: 0 }, {})
      .exec(function (err, result) {
         if (err) {
            ErrorHandling.ErrorLogCreation(req, 'Customer Login Error', 'customers.Controller -> customer_login', JSON.stringify(error));
            res.status(417).send({ Status: false, ErrorCode: 417, Message: "Some error occurred while Validate The Customer Details!." });
         } else {
            if (result === null) {
               customersModel.CustomersManagementSchema.findOne({'email': { $regex: new RegExp("^" + receivingData.email + "$", "i") } }, function(err_1, result_1) {
                  if(err_1) {
                     ErrorHandling.ErrorLogCreation(req, 'Customer Login Error', 'customers.Controller -> customer_login', JSON.stringify(error));
                     res.status(417).send({Status: false, ErrorCode: 417, Message: "Some error occurred while Validate The Customer Details!."});           
                  } else {
                     if (result_1 === null) {
                        res.status(200).send({ Status: false, Message: "Invalid account details!" });
                     } else {
                        if (result_1.Active_Status && !result_1.If_Deleted ) {
                           res.status(200).send({ Status: false, Message: "Email and Password do not match!" });
                        } else {
                           res.status(200).send({ Status: false, Message: "Your Account has Deactivated or Removed!" });
                        }
                     }
                  }
               });
            } else {
               var RandomToken = crypto.randomBytes(32).toString("hex");
               var UserData = JSON.parse(JSON.stringify(result));
               UserData.Token = RandomToken;
               var UserHash = CryptoJS.SHA512(JSON.stringify(UserData)).toString(CryptoJS.enc.Hex);
               var Ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
               var DeviceInfo = parser(req.headers['user-agent']);
               var LoginFrom = JSON.stringify({
                  Ip: Ip,
                  Request_From_Origin: req.headers.origin,
                  Request_From: req.headers.referer,
                  Request_Url: req.url,
                  Request_Body: req.body,
                  If_Get: req.params,
                  Device_Info: DeviceInfo,
               });
               var LoginHistory = new customersModel.LoginHistorySchema({
                  customer: result._id,
                  LoginToken: RandomToken,
                  Hash: UserHash,
                  LastActive: new Date(),
                  LoginFrom: LoginFrom,
                  Active_Status: true,
                  If_Deleted: false,
               });
               LoginHistory.save((err_2, result_2) => {
                  if (err_2) {
                     ErrorHandling.ErrorLogCreation(req, 'Customer Login  Error', 'customers.Controller -> customer_login', JSON.stringify(err_2));
                     res.status(417).send({ Status: false, Message: "Some error occurred while Validate Customer!" });
                  } else {
                     var ReturnResponse = CryptoJS.AES.encrypt(JSON.stringify(result), RandomToken.slice(3, 10)).toString();
                     res.status(200).send({ Status: true, Key: RandomToken, Response: ReturnResponse });}
               });                        
            }
         }
      });
   }
 };


// Customer Details
exports.customerDetails = function (req, res) {
   var receivingData = req.body;
   if (!receivingData.id || receivingData.id === '' || !ObjectId.isValid(receivingData.id)) {
       res.status(417).send({ Status: false, Message: "Customer Details can not be empty" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({ _id: ObjectId(receivingData.id), Active_Status: true, If_Deleted: false}, {password: 0}, {}).exec(),
         customersModel.CustomersManagementSchema.find({ referBy: ObjectId(receivingData.id) }, {password: 0}, {}).exec(),
      ]).then(response => {
         var customer = response[0];
         var referrals = response[1];
         var activeReferrals = 0;
         var rejectedReferrals = 0;
         referrals.map(obj => {
            if (obj.Active_Status && !obj.If_Deleted) {
               activeReferrals = activeReferrals + 1;
            } else {
               rejectedReferrals = rejectedReferrals + 1;
            }
         });
         if (customer !== null) {
            const Data = {
               customer: customer,
               referralCount: {
                  activeReferrals: activeReferrals,
                  rejectedReferrals: rejectedReferrals }
            };
            res.status(200).send({ Status: true, Response: Data });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid Customer Details!" });
         }
      }).catch( error => {
         ErrorHandling.ErrorLogCreation(req, 'Customer Details getting Error', 'customers.Controller -> customerDetails', JSON.stringify(error));
         res.status(417).send({ Status: false, ErrorCode: 417, Message: "Some error occurred while find The Customer Details!.", Error: error });
      });
   }
};
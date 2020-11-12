var helpModel = require('../models/help.model');
var customersModel = require('../models/customers.model');
var ErrorHandling = require('./../handling/ErrorHandling').ErrorHandling;
var ObjectId = require('mongoose').Types.ObjectId;
var fs = require('fs');

// Get Help Request ------------------------------------------ 
exports.getHelpRequest_Create = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else if (!receivingData.requestAmount || receivingData.requestAmount === '') {
      res.status(400).send({ Status: false, Message: "Request Amount can not be empty" });
   } else {
      customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), getHelpStatus: {$ne: 'In-Progress' }, Active_Status: true, If_Deleted: false }, {}, {})
      .exec( (err, result) => {
         if (err) {
            ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> getHelpRequest_Create', JSON.stringify(err));
            res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: err });
         } else {
            if (result !== null) {
               const Create_getHelp = new helpModel.getHelpManagementSchema({
                  customer: ObjectId(receivingData.customer),
                  requestAmount: parseInt(receivingData.requestAmount, 10),
                  pendingAmount: parseInt(receivingData.requestAmount, 10),
                  requestAmountInProgress: 0,
                  inTransferAmount: 0,
                  completedAmount: 0,
                  level: result.currentLevel,
                  requestedDate: new Date(),
                  completedDate: null,
                  status: 'Requested',
                  Active_Status: true,
                  If_Deleted: false,
               });
               Create_getHelp.save((err_1, result_1) => {
                  if (err_1) {
                     ErrorHandling.ErrorLogCreation(req, 'Get Help Request creating Error', 'help.Controller -> getHelpRequest_Create', JSON.stringify(err_1));
                     res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while creating the Get Help Request!.", Error: err_1 });
                  } else {
                     customersModel.CustomersManagementSchema.updateOne({_id: ObjectId(receivingData.customer)}, {$set: {getHelpStatus: 'In-progress' }}).exec();
                     res.status(200).send({ Status: true, Message: 'Get Help Request Completed', Response: result_1 });
                  }
               });
            } else {
               res.status(400).send({ Status: false, Message: "Invalid customer details" });
            }
         }
      });
   }
};


// Pending GetHelp Request
exports.Available_GetHelpRequestsList = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.id || receivingData.id === '' || !ObjectId.isValid(receivingData.id)) {
      res.status(417).send({ Status: false, Message: "Customer Details can not be empty" });
   } else if (!receivingData.provideAmount || receivingData.provideAmount === '') {
      res.status(400).send({ Status: false, Message: "Provide Amount can not be empty" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({ _id: ObjectId(receivingData.id), Active_Status: true, If_Deleted: false}, {password: 0}, {}).exec(),
         helpModel.getHelpManagementSchema.find({status: {$ne: 'Completed'}, pendingAmount: {$gt: 0}}, {}, {sort: {createdAt: 1}})
         .populate({path: 'customer', select: ['name', 'uniqueCode', 'mobile', 'whatsApp', 'accNum', 'branch', 'ifscCode', 'UPIid'] })
         .exec(),
      ]).then(response => {
         const customer = response[0];
         const helpRequests = response[1];
         var returnRequests = [];
         const provideAmount = parseInt(receivingData.provideAmount, 10);
         var totalAmount = 0;
         if (customer !== null) {
            helpRequests.map(obj => {
               if (totalAmount < provideAmount) {
                  var transferAmount = 0;
                  if (totalAmount === 0) {
                     if (obj.pendingAmount >= provideAmount) {
                        transferAmount = provideAmount;
                        totalAmount = provideAmount;
                     } else {
                        totalAmount = obj.pendingAmount;
                        transferAmount = obj.pendingAmount;
                     }
                  } else {
                     if (obj.pendingAmount >= (provideAmount - totalAmount) ) {
                        transferAmount = (provideAmount - totalAmount);
                        totalAmount = totalAmount + (provideAmount - totalAmount);
                     } else {
                        totalAmount = totalAmount + obj.pendingAmount;
                        transferAmount = obj.pendingAmount;
                     }
                  }
                  
                  const newObj = {
                     customer: obj.customer,
                     getHelpId: obj._id,
                     transferAmount: transferAmount,
                     status: 'Available'
                  };
                  returnRequests.push(newObj);
               }
            });
            res.status(200).send({ Status: true, Response: returnRequests });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch( error => {
         console.log(error);
         ErrorHandling.ErrorLogCreation(req, 'Customer Details getting Error', 'help.Controller -> Available_GetHelpRequestsList', JSON.stringify(error));
         res.status(417).send({ Status: false, ErrorCode: 417, Message: "Some error occurred while find The Customer Details!.", Error: error });
      });
   }
};


// Provide help create
exports.provideHelpRequest_Create = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(417).send({ Status: false, Message: "Customer Details can not be empty" });
   } else if (!receivingData.GetHelpRequests || typeof receivingData.GetHelpRequests !== 'object' || receivingData.GetHelpRequests === null) {
      res.status(400).send({ Status: false, Message: "Invalid details detected" });
   } else {
      var GetHelpVerification = [];
      receivingData.GetHelpRequests.map(obj => {
         const newObj = {
            _id: ObjectId(obj.getHelp),
            transferAmount: parseInt(obj.transferAmount)
         };
         GetHelpVerification.push(newObj);
      });
      Promise.all(
         GetHelpVerification.map(obj => {
            return helpModel.getHelpManagementSchema.findOne({ _id: obj._id, pendingAmount: {$gte: obj.transferAmount} }, { pendingAmount: 1}, {}).exec();
         })
      ).then( response => {
         var nullDetected = false;
         response.map(obj => { 
            if (obj === null) {
               nullDetected = true;
            }
         });
         if (!nullDetected) {
            customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), provideHelpStatus: 'Open', Active_Status: true, If_Deleted: false }, {}, {})
            .exec( (err, result) => {
               if (err) {
                  ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelpRequest_Create', JSON.stringify(err));
                  res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: err });
               } else {
                  if (result !== null) {
                     var getHelpUpdates = [];
                     var provideHelps = [];
                     receivingData.GetHelpRequests.map(obj => {
                        const newObj = {
                           _id: ObjectId(obj.getHelp),
                           requestAmount: parseInt(obj.transferAmount),
                           pendingAmount: parseInt(obj.transferAmount) -  (parseInt(obj.transferAmount) * 2),
                        };
                        getHelpUpdates.push(newObj);
                        const Create_provideHelp = new helpModel.provideHelpManagementSchema({
                           customer: ObjectId(receivingData.customer),
                           getHelp: ObjectId(obj.getHelp),
                           transferAmount: parseInt(obj.transferAmount),
                           level: obj.currentLevel,
                           requestedDate: new Date(),
                           PaymentDate: null,
                           completedDate: null,
                           status: 'Requested',
                           Active_Status: true,
                           If_Deleted: false,
                        });
                        provideHelps.push(Create_provideHelp);
                     });
                     helpModel.provideHelpManagementSchema.insertMany(provideHelps, (err_1, result_1) => {
                        if (err_1) {
                           ErrorHandling.ErrorLogCreation(req, 'Provide Help Request creating Error', 'help.Controller -> provideHelpRequest_Create', JSON.stringify(err_1));
                           res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while creating the Provide Help Request!.", Error: err_1 });
                        } else {
                           Promise.all(
                              getHelpUpdates.map(obj => {
                                 return helpModel.getHelpManagementSchema.updateOne({ _id: obj._id}, { $inc: { requestAmountInProgress: obj.requestAmount, pendingAmount: obj.pendingAmount } }).exec();
                              })
                           ).then(response => {
                              customersModel.CustomersManagementSchema.updateOne({_id: ObjectId(receivingData.customer)}, {$set: {provideHelpStatus: 'In-progress' }}).exec();
                              res.status(200).send({ Status: true, Response: result_1 });
                           }).catch(error => {
                              ErrorHandling.ErrorLogCreation(req, 'Get Help Request update Error', 'help.Controller -> provideHelpRequest_Create', JSON.stringify(error));
                              res.status(417).send({ Http_Code: 417, Status: false, Message: 'Get Help Request update error', Error: error});
                           });
                        }
                     });
                  } else {
                     res.status(400).send({ Status: false, Message: "Invalid customer details" });
                  }
               }
            });
         } else {
            res.status(400).send({ Status: false, Message: "Some One already helped this person, Please refresh the page and try again!" });
         }
      }).catch( error => {
         ErrorHandling.ErrorLogCreation(req, 'Get Help Request Validation Error', 'help.Controller -> provideHelpRequest_Create', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: 'Get Help Request Validation error', Error: error});
      });
   }
};


// Provide Help Request Me ------------------------------------------ 
exports.provideHelpRequest_toMe = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), getHelpStatus: {$ne: 'Pending'}, Active_Status: true, If_Deleted: false }, {}, {}).exec(),
         helpModel.getHelpManagementSchema.findOne({customer: ObjectId(receivingData.customer), status: {$ne: 'Completed' }, Active_Status: true, If_Deleted: false }, {}, {}).exec()
      ]).then(response => {
         var customer = response[0];
         var getHelpRequest =  response[1];
         if (customer !== null && getHelpRequest !== null) {
            helpModel.provideHelpManagementSchema.find({getHelp: getHelpRequest._id, Active_Status: true, If_Deleted: false  })
            .populate({path: 'customer', select: ['name', 'uniqueCode', 'mobile', 'whatsApp', 'accNum', 'branch', 'ifscCode', 'UPIid'] })
            .populate({path: 'getHelp', select: ['totalRequestAmount', 'pendingAmount', 'requestAmountInProgress', 'inTransferAmount', 'completedAmount', 'requestedDate'] })
            .exec((err, result) => {
               if (err) {
                  ErrorHandling.ErrorLogCreation(req, 'Provide help details getting Error', 'help.Controller -> provideHelpRequest_toMe', JSON.stringify(err));
                  res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the Provide help details!.", Error: err });
               } else {
                  res.status(200).send({ Status: true, Response: result });
               }
            });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch(error => {
         ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelpRequest_toMe', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: error });
      });
   }
};


// Provide Help Request Accept ------------------------------------------ 
exports.provideHelpRequest_Accept = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else if (!receivingData.provideHelp || receivingData.provideHelp === '' || !ObjectId.isValid(receivingData.provideHelp)) {
      res.status(400).send({ Status: false, Message: "provide help details invalid" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), Active_Status: true, If_Deleted: false }, {}, {}).exec(),
         helpModel.provideHelpManagementSchema.findOne({_id: ObjectId(receivingData.provideHelp), status: 'Requested' }, {}, {}).exec()
      ]).then(response => {
         var customer = response[0];
         var provideHelpRequest =  response[1];
         if (customer !== null && provideHelpRequest !== null) {
            helpModel.provideHelpManagementSchema.updateOne({_id: provideHelpRequest._id}, { $set: {status: 'RequestedAccepted' } } ).exec((err, result) => {
               if (err) {
                  ErrorHandling.ErrorLogCreation(req, 'Provide help request accept getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(err));
                  res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while accept Provide help request!.", Error: err });
               } else {
                  const inTransfer = provideHelpRequest.transferAmount;
                  const requestInProgress = provideHelpRequest.transferAmount - (provideHelpRequest.transferAmount * 2);
                  helpModel.getHelpManagementSchema.updateOne({_id: provideHelpRequest.getHelp}, { $inc: { requestAmountInProgress: requestInProgress, inTransferAmount: inTransfer} })
                  .exec((err_1, result_1) => {
                     if (err_1) {
                        ErrorHandling.ErrorLogCreation(req, 'Get help request update getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(err_1));
                        res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while update Get help request!.", Error: err_1 });
                     } else {
                        res.status(200).send({ Status: true, Response: result });
                     }
                  });
               }
            });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch(error => {
         ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: error });
      });
   }
};


// Get Help Request Me ------------------------------------------ 
exports.getHelpRequest_toMe = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({ _id: ObjectId(receivingData.customer), provideHelpStatus: 'In-progress', Active_Status: true, If_Deleted: false }, {}, {}).exec(),
         helpModel.provideHelpManagementSchema.find({ customer: ObjectId(receivingData.customer) }, {}, {})
         .populate({path: 'getHelp', select: 'customer', populate: { path: 'customer', select: ['name', 'uniqueCode', 'mobile', 'whatsApp', 'accNum', 'branch', 'ifscCode', 'UPIid'] }})
         .exec()
      ]).then(response => {
         var customer = response[0];
         var getHelpRequest =  response[1];
         if (customer !== null && getHelpRequest.length > 0) {
            var returnRequests = [];
            getHelpRequest.map(obj => {
               if (obj.level === customer.currentLevel) {
                  const newObj = {
                     customer: obj.getHelp.customer,
                     ProvideHelpId: obj._id,
                     transferAmount: obj.transferAmount,
                     remarks: obj.remarks,
                     proofFile: obj.proofFile || '',
                     status: obj.status
                  };
                  returnRequests.push(newObj);
               }
            });
            res.status(200).send({ Status: true, Response: returnRequests });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch(error => {
         ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelpRequest_toMe', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: error });
      });
   }
};


// Provide Help Request Reject ------------------------------------------ 
exports.provideHelpRequest_Reject = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else if (!receivingData.provideHelp || receivingData.provideHelp === '' || !ObjectId.isValid(receivingData.provideHelp)) {
      res.status(400).send({ Status: false, Message: "provide help details invalid" });
   } else {
      var before72hrs = new Date( new Date().setHours(new Date().getHours() - 12));
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), Active_Status: true, If_Deleted: false }, {}, {}).exec(),
         helpModel.provideHelpManagementSchema.findOne({_id: ObjectId(receivingData.provideHelp), status: 'RequestedAccepted', updatedAt: { $lte: before72hrs } }, {}, {}).exec()
      ]).then(response => {
         var customer = response[0];
         var provideHelpRequest =  response[1];
         if (customer !== null && provideHelpRequest !== null) {
            helpModel.provideHelpManagementSchema.updateOne({_id: provideHelpRequest._id}, { $set: {status: 'RequestedRejected', Active_Status: false, If_Deleted: true } } ).exec((err, result) => {
               if (err) {
                  ErrorHandling.ErrorLogCreation(req, 'Provide help request reject getting Error', 'help.Controller -> provideHelpRequest_Reject', JSON.stringify(err));
                  res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while reject Provide help request!.", Error: err });
               } else {
                  const reqAmount = provideHelpRequest.transferAmount;
                  const inTransfer = provideHelpRequest.transferAmount - (provideHelpRequest.transferAmount * 2);
                  helpModel.getHelpManagementSchema.updateOne({_id: provideHelpRequest.getHelp}, { $inc: { pendingAmount: reqAmount, inTransferAmount: inTransfer} })
                  .exec((err_1, result_1) => {
                     if (err_1) {
                        ErrorHandling.ErrorLogCreation(req, 'Get help request update getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(err_1));
                        res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while update Get help request!.", Error: err_1 });
                     } else {
                        customersModel.CustomersManagementSchema.updateOne({_id: ObjectId(provideHelpRequest.customer)}, { $set: { provideHelpStatus: 'Open', Active_Status: false, If_Deleted: true, deActiveReason: 'You are not completing the provide help payment within 12Hours, so your account has blocked.' }}).exec();
                        res.status(200).send({ Status: true, Response: result });
                     }
                  });
               }
            });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch(error => {
         ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelpRequest_Reject', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: error });
      });
   }
};


// Provide Help Payment Proof Update ------------------------------------------ 
exports.provideHelp_PaymentProofUpdate = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else if (!receivingData.provideHelp || receivingData.provideHelp === '' || !ObjectId.isValid(receivingData.provideHelp)) {
      res.status(400).send({ Status: false, Message: "provide help details invalid" });
   } else if (!receivingData.proof || receivingData.proof === '' ) {
      res.status(400).send({ Status: false, Message: "proof details invalid" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), provideHelpStatus: 'In-progress', Active_Status: true, If_Deleted: false }, {}, {}).exec(),
         helpModel.provideHelpManagementSchema.findOne({_id: ObjectId(receivingData.provideHelp), status: 'RequestedAccepted' }, {}, {}).exec()
      ]).then(response => {
         var customer = response[0];
         var provideHelpRequest =  response[1];
         if (customer !== null && provideHelpRequest !== null) {
            var data = receivingData.proof.replace(/^data:image\/\w+;base64,/, "");
            const fileContents = new Buffer.from(data, 'base64');
            var filename =  receivingData.provideHelp + '.jpeg';
            var fullFileName = 'uploads/payment-proofs/' + filename;
            fs.writeFile(fullFileName, fileContents, (err) => { if (err) { console.log(err); }});
            helpModel.provideHelpManagementSchema.updateOne({_id: provideHelpRequest._id}, { $set: {status: 'PaymentSent', proofFile: filename, remarks: receivingData.remarks } } ).exec((err, result) => {
               if (err) {
                  ErrorHandling.ErrorLogCreation(req, 'Provide help proof update getting Error', 'help.Controller -> provideHelp_PaymentProofUpdate', JSON.stringify(err));
                  res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while update the Provide help proof!.", Error: err });
               } else {
                  res.status(200).send({ Status: true, Response: result });
               }
            });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch(error => {
         console.log(error);
         ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelp_PaymentProofUpdate', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: error });
      });
   }
};


// Provide Help Request Payment Accept ------------------------------------------ 
exports.provideHelpRequest_PaymentAccept = function (req, res) {
   var receivingData = req.body;

   if (!receivingData.customer || receivingData.customer === '' || !ObjectId.isValid(receivingData.customer)) {
      res.status(400).send({ Status: false, Message: "Customer can not be empty" });
   } else if (!receivingData.provideHelp || receivingData.provideHelp === '' || !ObjectId.isValid(receivingData.provideHelp)) {
      res.status(400).send({ Status: false, Message: "provide help details invalid" });
   } else {
      Promise.all([
         customersModel.CustomersManagementSchema.findOne({_id: ObjectId(receivingData.customer), getHelpStatus: 'In-progress', Active_Status: true, If_Deleted: false }, {}, {}).exec(),
         helpModel.provideHelpManagementSchema.findOne({_id: ObjectId(receivingData.provideHelp), status: 'PaymentSent' }, {}, {}).exec(),
      ]).then(response => {
         var customer = response[0];
         var provideHelpRequest =  response[1];
         if (customer !== null && provideHelpRequest !== null) {
            Promise.all([
               helpModel.provideHelpManagementSchema.updateOne({_id: provideHelpRequest._id}, { $set: {status: 'PaymentVerified' } } ).exec(),
               helpModel.getHelpManagementSchema.findOne({_id: provideHelpRequest.getHelp} ).exec(),
               helpModel.provideHelpManagementSchema.find({customer: ObjectId(provideHelpRequest.customer), $or: [{status: 'Requested'}, {status: 'RequestedAccepted'}, {status: 'PaymentSent'}] }, {}, {}).exec()
            ]).then(response_1 => {
               var getHelpData = response_1[1];
               var provideHelpData = response_1[2];
               if (getHelpData.pendingAmount === 0 && getHelpData.requestAmountInProgress === 0 && getHelpData.inTransferAmount === provideHelpRequest.transferAmount) {
                  const LevelCode = customer.currentLevel.split('_')[1];
                  const nextLevelCode = parseInt(LevelCode, 10);
                  const nextLevel = 'Level_' + (nextLevelCode + 1);
                  Promise.all([
                     helpModel.getHelpManagementSchema.updateOne({_id: provideHelpRequest.getHelp}, { $set: {status: 'Completed',  inTransferAmount: 0, completedAmount: (getHelpData.completedAmount + provideHelpRequest.transferAmount) } }).exec(),
                     customersModel.CustomersManagementSchema.updateOne({_id: ObjectId(receivingData.customer)}, { $set: { currentLevel: nextLevel, getHelpStatus: 'Completed', provideHelpStatus: 'Open', getHelpCompletionDate: new Date() }}).exec()
                  ]).then(response_2 => {
                     res.status(200).send({ Status: true, Response: response_2[0] });
                  }).catch( error => {
                     ErrorHandling.ErrorLogCreation(req, 'Get help completion update getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(error));
                     res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while update Get help completion!.", Error: error });
                  });
               } else {
                  const completed = provideHelpRequest.transferAmount;
                  const inTransfer = provideHelpRequest.transferAmount - (provideHelpRequest.transferAmount * 2);
                  helpModel.getHelpManagementSchema.updateOne({_id: provideHelpRequest.getHelp}, { $inc: { inTransferAmount: inTransfer, completedAmount: completed} })
                  .exec((err_1, result_1) => {
                     if (err_1) {
                        ErrorHandling.ErrorLogCreation(req, 'Get help request update getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(err_1));
                        res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while update Get help request!.", Error: err_1 });
                     } else {
                        res.status(200).send({ Status: true, Response: result_1 });
                     }
                  });
               }
               if (provideHelpData.length < 1 || (provideHelpData.length === 1 && provideHelpData[0]._id === provideHelpRequest._id)) {
                  customersModel.CustomersManagementSchema.updateOne({_id: ObjectId(provideHelpRequest.customer)}, { $set: { provideHelpStatus: 'Completed', provideCompletionDate: new Date() }}).exec();
               }
            }).catch( error => {
               ErrorHandling.ErrorLogCreation(req, 'Provide help request accept getting Error', 'help.Controller -> provideHelpRequest_Accept', JSON.stringify(error));
               res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while accept Provide help request!.", Error: error });
            });
         } else {
            res.status(400).send({ Status: false, Message: "Invalid customer details" });
         }
      }).catch(error => {
         ErrorHandling.ErrorLogCreation(req, 'Customer details getting Error', 'help.Controller -> provideHelpRequest_toMe', JSON.stringify(error));
         res.status(417).send({ Http_Code: 417, Status: false, Message: "Some error occurred while find the customer details!.", Error: error });
      });
   }
};

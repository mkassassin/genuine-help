var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// GetHelp Management Schema
var getHelpManagementSchema = mongoose.Schema({
   customer: { type: Schema.Types.ObjectId, ref: 'customers' },
   totalRequestAmount: { type: Number },
   pendingAmount: { type: Number },
   requestAmountInProgress: { type: Number },
   inTransferAmount: { type: Number },
   completedAmount: { type: Number },
   level: { type: String },
   requestedDate: { type: Date },
   completedDate: { type: Date },
   status: { type: String }, // Requested, InProgress, Completed
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);
var VarGetHelp = mongoose.model('getHelp', getHelpManagementSchema, 'getHelp');


// ProvideHelp Management Schema
var provideHelpManagementSchema = mongoose.Schema({
   getHelp: { type: Schema.Types.ObjectId, ref: 'getHelp' },
   customer: { type: Schema.Types.ObjectId, ref: 'customers' },
   transferAmount: { type: Number },
   level: { type: String },
   requestedDate: { type: Date },
   PaymentDate: { type: Date },
   completedDate: { type: Date },
   status: { type: String }, // Requested, RequestedAccepted, PaymentSent, PaymentVerified, PaymentReported
   remarks: { type: String },
   proof: { type: String }, // base64
   proofFile: { type: String },
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);
var VarProvideHelp = mongoose.model('provideHelp', provideHelpManagementSchema, 'provideHelp');


module.exports = {
   getHelpManagementSchema : VarGetHelp,
   provideHelpManagementSchema: VarProvideHelp
};

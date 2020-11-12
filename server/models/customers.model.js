var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Customers Management Schema
var CustomersManagementSchema = mongoose.Schema({
   name: { type: String },
   uniqueCode: { type: String },
   uniqueNumber: { type: Number },
   email: { type: String, unique: true },
   mobile: { type: String },
   whatsApp: { type: String },
   ePin: { type: Schema.Types.ObjectId, ref: 'ePins' },
   password: {type: String},
   accNum: { type: String },
   ifscCode: { type: String},
   branch: { type: String},
   UPIid: { type: String},
   termsAgree: { type : Boolean },  
   referBy: { type: Schema.Types.ObjectId, ref: 'customers' },
   currentLevel: { type : String }, // Level_1, Level_2, Level_3 ....
   provideHelpStatus: {type : String}, // Pending, Open, In-progress, Completed
   getHelpStatus: {type : String}, // Pending, Open, In-progress, Completed
   provideCompletionDate: { type : Date },
   getHelpCompletionDate: { type : Date },
   lastLevelCompletionDate: { type : Date },
   deActiveReason: { type : String },
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);
var VarCustomers = mongoose.model('customers', CustomersManagementSchema, 'customers');


// Customers LoginHistory Schema 
var LoginHistorySchema = mongoose.Schema({
   customer: { type: Schema.Types.ObjectId, ref: 'customers' },
   LoginToken: { type: String },
   Hash: { type: String },
   LastActive: { type: Date },
   LoginFrom: { type: String },
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);
var VarLoginHistory = mongoose.model('customers_login_history', LoginHistorySchema, 'customers_login_history');
 

module.exports = {
   CustomersManagementSchema : VarCustomers,
   LoginHistorySchema: VarLoginHistory
};

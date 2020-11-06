var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// E-Pin Management Schema
var ePinManagementSchema = mongoose.Schema({
   ePin: { type: String },
   purchasedBy: { type: Schema.Types.ObjectId, ref: 'customers' },
   UsedBy: { type: Schema.Types.ObjectId, ref: 'customers' },
   purchasedDate: { type: Date },
   usedDate: { type: Date },
   ePinStatus: { type: String }, // Created, Purchased, Used
   Active_Status: { type : Boolean },
   If_Deleted: { type : Boolean },
   },
   { timestamps: true }
);
var VarEPins = mongoose.model('ePins', ePinManagementSchema, 'ePins');


module.exports = {
   EPinManagementSchema : VarEPins,
};

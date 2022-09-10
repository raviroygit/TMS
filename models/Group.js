const mongoose = require('mongoose');
const BaseClass = require('./BaseClass');
const { ObjectId } = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const GroupSchema = new mongoose.Schema(
  {
    merchantName: {
      type: String,
      required: true,
      unique: true
    },
    streetAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    openingTime: {
      type: Date
    },
    isParent: {
      type: Boolean,
      default: true
    },
    terminal: [{ type: ObjectId, ref: 'Terminal' }],
    issueDate: {
      type: Date,
      default: Date.now(),
    },
    subGroup: [{ type: ObjectId, ref: 'Group' }],
    groupType: {
      type: String,
      enum: ['bank', 'providerServices', 'simpleGroup'],
    },
    parameterFile: { type: ObjectId, ref: 'FileStore' },
    isRoot:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

GroupSchema.plugin(uniqueValidator);
const Group = mongoose.model(
  'Group',
  GroupSchema
);

module.exports = Group;

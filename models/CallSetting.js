const mongoose = require('mongoose');
const BaseClass = require('./BaseClass');
const uniqueValidator = require('mongoose-unique-validator');

require('mongoose-double')(mongoose);

const CallSettingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['OS', 'Application']
    },
    file: {
      type: String,
    },
    version: {
      type: String,
    },
    startDateTime: {
      type: Date,
    },
    endDateTime: {
      type: Date,
    },
    executeOn: {
      type: String,
      enum: ['terminal', 'group']
    },
    terminalSerialNumber: {
      type: Array,
    }
  },

  { timestamps: true }
);

CallSettingSchema.plugin(uniqueValidator);
const CallSetting = mongoose.model(
  'CallSetting',
  CallSettingSchema
);

module.exports = CallSetting;

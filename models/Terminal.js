const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const { STATUS } = require('../constants/index');

const TerminalSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,

    },
    systemIdentifier: {
      type: String,
      trim: true,
      required: true,
    },
    acquirerIPAddress: {
      type: String,
      trim: true,
      required: true,
    },
    acquiredPort: {
      type: String,
      trim: true,
      required: true,
    },
    TLS: {
      type: Boolean,
      default: false
    },
    acceptanceSystemID: {
      type: String,
      trim: true,
    },
    ISA: {
      type: String,
      trim: true,
    },
    applicationId: {
      type: String,
      trim: true,
    },
    terminalStoreId: {
      type: String,
      trim: true,
    },
    settingId: {
      type: String,
      trim: true,
    },

    registrationDate: {
      type: Date,
      default: Date.now(),
    },
    lastCallDate: {
      type: Date
    },
    status: {
      type: String,
      enum: [STATUS.DECLARED, STATUS.ACTIVATE, STATUS.PASSIVE, STATUS.OFFLINE],
      default: STATUS.DECLARED
    },
    osVersion: {
      type: String,
    },
    kernelVersion: {
      type: String,
    },
    appVersion: {
      type: String
    },
    terminalModel: {
      type: String,
    },
    totalRam: {
      type: Number
    },
    usedRam: {
      type: Number
    },
    totalDiskSpace: {
      type: Number
    },
    usedDiskSpace: {
      type: Number
    },
    manufacturer: {
      type: String
    },
    merchantName: {
      type: String
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      type: String
    },
    simSerialNo: {
      type: String
    },
    operatorName: {
      type: String,
      default: "GSM"
    },
    blVersion: {
      type: String,
    },
    apn: {
      type: String,
    },
    comment: {
      type: String
    },
    latitude: {
      type: String
    },
    longitude: {
      type: String
    },
    isLogsUpload: {
      type: Boolean,
      Default: false
    }
  },
  { timestamps: true }
);

TerminalSchema.plugin(uniqueValidator);
const Terminal = mongoose.model(
  'Terminal',
  TerminalSchema
);

module.exports = Terminal;

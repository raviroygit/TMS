const mongoose = require('mongoose');
const BaseClass = require('./BaseClass');
const uniqueValidator = require('mongoose-unique-validator');
require('mongoose-double')(mongoose);

const FileStoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
      enum: ['Parameter_Prod', 'Parameter_Test', 'Parameter_Bill', 'Blacklist']
    },
    version: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    supplier: {
      type: String
    },
    description: {
      type: String
    },
    base64: {
      type: String
    },
    lastUpdate: Date,
  },

  { timestamps: true }
);

FileStoreSchema.plugin(uniqueValidator);
const FileStore = mongoose.model(
  'FileStore',
  FileStoreSchema
);

module.exports = FileStore;

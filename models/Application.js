const mongoose = require('mongoose');

require('mongoose-double')(mongoose);

const ApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    title: {
      type: String,
      required:true
    },
    type: {
      type: String,
      enum: ['Application', 'Kernel', 'OS'],
    },
    version: {
      type: String,
      default: 0
    },
    developer: {
      type: String
    },
    base64: {
      type: String
    },
    logo: {
      type: String
    },
    appType: {
      type: String,
      enum: ["Android", "IOS"]
    },
    price: {
      type: String,
      enum: ["Free", "Paid"]
    },
    autoUpdate: {
      type: Boolean,
      default: false
    },
    size: {
      type: String
    },
    model: {
      type: String
    },
    businessCategories: {
      type: String,
      enum: ["POS"]
    },
    screenShots: {
      type: Array
    },
    description: {
      type: String
    },
    releaseNote: {
      type: String
    },
    isVerified:{
      type:Boolean,
      default:false
    },
    terminals:{
      type:Array
    },
    versionCode:{
      type:String
    },
    compileSdkVersion:{
      type:String
    },
    package:{
      type:String
    }
  },

  { timestamps: true }
);

const FileStore = mongoose.model(
  'Application',
  ApplicationSchema
);

module.exports = FileStore;

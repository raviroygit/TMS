const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const StatusLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
    },
    terminals: {
      type: Array,
    },
    action: {
      type: String,
    },
    comment: {
      type: String,
    },
    fileName: {
      type: String
    },
    downloadHistory: {
      type: Array,
    }
  },
  { timestamps: true }
);

const StatusLog = mongoose.model("StatusLog", StatusLogSchema);

module.exports = StatusLog;

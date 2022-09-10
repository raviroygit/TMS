const mongoose = require('mongoose');

const LogsSchema = new mongoose.Schema(
  {
    logsFile: {
      type: String,
    },
    terminal: {
      type: String
    },
  },

  { timestamps: true }
);

const Logs = mongoose.model(
  'Logs',
  LogsSchema
);

module.exports = Logs;

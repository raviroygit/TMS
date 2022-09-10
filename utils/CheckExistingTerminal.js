const Terminal = require('../models/Terminal');

const isTerminalExist = async (serialNumber) => {
  const existTerminal = await Terminal.findOne({ serialNumber: serialNumber }).select('_id status');

  if (!existTerminal) {
    return null;
  }
  return (existTerminal);
};

module.exports = {
  isTerminalExist
};
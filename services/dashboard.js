const Terminal = require("../models/Terminal");
const Merchant = require("../models/Group");
const logger = require("../logger");
const { STATUS } = require("../constants/index");

const dashboard = (data) => {
  const funcIdentifier = logger.debugIn(__filename, { dashboard }, { data });
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};
      if (data.startDate && data.endDate) {
        query.createdAt = {
          $gte: new Date(`${data.startDate}`),
          $lte: new Date(`${data.endDate}`),
        };
      }
      const groupQuery = {};
      if (data.groupName) {
        groupQuery.merchantName = data.groupName
      }
      const groupWithSubGroup = await Merchant.find(groupQuery).populate('subGroup');

      if (groupWithSubGroup && groupWithSubGroup.length > 0) {
        const terminals = await Terminal.find();
        const findTerminalByGroup = terminals && terminals.length > 0 && terminals.filter(terminal => groupWithSubGroup[0].terminal && groupWithSubGroup[0].terminal.length > 0 && groupWithSubGroup[0].terminal.includes(terminal._id));
        let activeShortDateTerminal = await Terminal.find(query);
        if (data.groupName) {
          activeShortDateTerminal = activeShortDateTerminal.filter(terminal => groupWithSubGroup[0].terminal && groupWithSubGroup[0].terminal.length > 0 && groupWithSubGroup[0].terminal.includes(terminal._id));
        }
        if (findTerminalByGroup) {
          const dashboardData = {};
          const activeTerminals = activeShortDateTerminal.filter(
            (e) => e.status === STATUS.ACTIVATE
          );
          dashboardData.dashboardStatus = {
            activeTerminals: activeTerminals.length,
            inactiveTerminals:
              activeShortDateTerminal.length - activeTerminals.length,
          };
          let modelQuery = [];
          if (data.groupName) {
            modelQuery.push({ $match: { _id: { $in: groupWithSubGroup[0].terminal } } });
          };
          modelQuery.push({ $group: { _id: "$terminalModel", count: { $sum: 1 } } })
          const dashboardModel = await Terminal.aggregate([...modelQuery]);
          dashboardData.dashboardModel = dashboardModel;
          dashboardData.dashboardGroups = groupWithSubGroup.map((e) => ({
            name: e.merchantName,
            terminalCount: e.terminal.length,
            type: e.groupType,
            isRoot: e.isRoot
          }));
          dashboardData.dashboardGroups.sort(
            (a, b) => (a.terminalCount < b.terminalCount && 1) || -1
          );
          logger.debugOut(__filename, { dashboard }, funcIdentifier, 0);
          dashboardData.terminalLocation = [];
          activeShortDateTerminal.forEach(terminal => {
            if (terminal.latitude && terminal.longitude) {
              dashboardData.terminalLocation.push({
                serialNumber: terminal.serialNumber,
                location: [terminal.latitude, terminal.longitude]
              })
            }
          }
          );
          return resolve(dashboardData);
        }
      }

      logger.warn(__filename, { dashboard }, funcIdentifier, "DATA_NOT_FOUND");

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: "DATA_NOT_FOUND",
        },
      });
    } catch (err) {
      logger.warn(__filename, { dashboard }, funcIdentifier, err);

      return reject({
        statusCode: 500,
        errorDetails: {
          errorCode: "UNKNOWN_ERROR",
          errorDetails: err.toString(),
        },
      });
    }
  });
};

module.exports = {
  dashboard,
};

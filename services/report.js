const Terminal = require('../models/Terminal');
const logger = require('../logger');
const FileStore = require('../models/FileStore');
const Application = require('../models/Application');
const Group = require('../models/Group');
const moment = require('moment')

/*Get the search and filter result based on input
    return: The details of terminal Response data to the route.*/
const report = (data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { report },
    { data }
  );

  return new Promise(async (resolve, reject) => {
    try {
      let query = {};
      if (data.registrationDate) {
        query.registrationDate = data.registrationDate;
      }
      if (data.operatorName) {
        query.operatorName = data.operatorName;
      }
      if (data.serialNumber) {
        query.serialNumber = { $regex: `^${data.serialNumber}` };
      }
      if (data.systemIdentifier) {
        query.systemIdentifier = { $regex: `^${data.systemIdentifier}` };
      }
      if (data.acquirerIPAddress) {
        query.acquirerIPAddress = data.acquirerIPAddress;
      }
      if (data.acquiredPort) {
        query.acquiredPort = data.acquiredPort;
      }
      if (data.TLS) {
        query.TLS = data.TLS;
      }
      if (data.ISA) {
        query.ISA = data.ISA;
      }
      if (data.applicationId) {
        query.applicationId = data.applicationId;
      }
      if (data.terminalStoreId) {
        query.terminalStoreId = data.terminalStoreId;
      }
      if (data.settingId) {
        query.settingId = data.settingId;
      }
      if (data.status) {
        query.status = data.status;
      }
      if (data.osVersion) {
        query.osVersion = data.osVersion;
      }
      if (data.kernelVersion) {
        query.kernelVersion = data.kernelVersion;
      }
      if (data.appVersion) {
        query.appVersion = data.appVersion;
      }
      if (data.terminalModel) {
        query.terminalModel = data.terminalModel;
      }
      if (data.manufacturer) {
        query.manufacturer = data.manufacturer;
      }
      if (data.merchantName) {
        query.merchantName = data.merchantName;
      }
      if (data.simSerialNo) {
        query.simSerialNo = data.simSerialNo;
      }
      if (data.operatorName && !data.operatorName === "$nin") {
        query.operatorName = data.operatorName;
      }
      if (data.operatorName === "$nin") {
        query.operatorName = { $exists: false }
      }
      if (data.paramVersion) {
        query.paramVersion = data.paramVersion;
      }
      if (data.blVersion) {
        query.blVersion = data.blVersion;
      }
      if (data.apn) {
        query.apn = data.apn;
      }
      if (data.type) {
        query.type = data.type;
      }
      if (data.city) {
        query.city = { $regex: `^${data.city}` };
      }
      if (data.startDate && data.endDate) {
        const newEndDate = new Date(`${data.endDate}`);
        query.createdAt = {
          $gte: new Date(`${data.startDate}`),
          $lte: new Date(`${new Date(newEndDate.setDate(newEndDate.getDate() + 1))}`)
        }
      } else if (data.startDate && !data.endDate) {
        query.createdAt = {
          $gte: new Date(`${data.startDate}`),
          $lte: new Date()
        }
      } else if (!data.startDate && data.endDate) {
        const newEndDate = new Date(`${data.endDate}`);
        query.createdAt = {
          $gte: new Date('2000-01-01'),
          $lte: new Date(`${new Date(newEndDate.setDate(newEndDate.getDate() + 1))}`)
        }
      }
      if (data.lastCallDateStart && data.lastCallDateEnd) {
        const lastCallStart = new Date(`${data.lastCallDateStart}`);
        const newLastConnectionDate = new Date(`${data.lastCallDateEnd}`);
        query.lastCallDate = {
          $gte: new Date(`${lastCallStart}`),
          $lte: new Date(`${new Date(newLastConnectionDate.setDate(newLastConnectionDate.getDate()))}`)
        }
      } else if (data.lastCallDateStart && !data.lastCallDateEnd) {
        const lastCallStart = new Date(`${data.lastCallDateStart}`);
        query.lastCallDate = {
          $gte: new Date(`${lastCallStart}`),
          $lte: new Date()
        }
      } else if (!data.lastCallDateStart && data.lastCallDateEnd) {
        const newLastConnectionDate = new Date(`${data.lastCallDateEnd}`);
        query.lastCallDate = {
          $gte: new Date('2000-01-01'),
          $lte: new Date(`${new Date(newLastConnectionDate.setDate(newLastConnectionDate.getDate() + 1))}`)
        }
      }
      if (data.createdAt) {
        const newCreatedAt = new Date(`${data.createdAt}`);
        query.createdAt = {
          $gte: new Date(`${new Date(newCreatedAt.setDate(newCreatedAt.getDate()))}`),
          $lt: new Date(`${new Date(newCreatedAt.setDate(newCreatedAt.getDate() + 1))}`)
        }
      }
      if (data.group && data.group !== "$nin") {
        const groupQuery = {};
        if (data.group && data.subGroup) {
          groupQuery._id = data.subGroup;
        };
        if (data.group && !data.subGroup) {
          groupQuery._id = data.group;
        }
        const groupTerminal = await Group.findOne(groupQuery).select('terminal');
        if (groupTerminal.terminal) {
          query._id = { $in: groupTerminal.terminal };
        }
      }
      if (data.group === "$nin") {
        const groupTerminal = await Group.find().select('-_id terminal');
        let groupAssociatedTerminal = [];
        groupTerminal.forEach(x => {
          if (x.terminal && x.terminal.length > 0) {
            groupAssociatedTerminal.push(...x.terminal);
          }
        })
        query._id = { $nin: groupAssociatedTerminal }
      };

      if (query) {
        const result = await Terminal.find(query);
        logger.debugOut(
          __filename,
          { report },
          funcIdentifier,
          0
        );
        return resolve(result);
      }

      logger.warn(
        __filename,
        { report },
        funcIdentifier,
        'DATA_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'DATA_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { report },
        funcIdentifier,
        err
      );

      return reject({
        statusCode: 500,
        errorDetails: {
          errorCode: 'UNKNOWN_ERROR',
          errorDetails: err.toString(),
        }
      });
    }
  });
};

const reportFilter = () => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { reportFilter },
  );

  return new Promise(async (resolve, reject) => {
    try {
      const modelOperatorData = await Terminal.aggregate([
        {
          "$group": {
            _id: null,
            terminalModel: { $addToSet: "$terminalModel" },
            operatorName: { $addToSet: "$operatorName" }
          }
        }
      ]);
      const applicationVersion = await Application.distinct("version");
      const blackListVersion = await FileStore.distinct("version");
      const groups = await Group.find().select('_id merchantName terminal isParent subGroup isRoot');

      const result = {};
      if (modelOperatorData.length > 0) {
        result.terminalModel = modelOperatorData[0].terminalModel;
        result.operatorName = modelOperatorData[0].operatorName;
      }
      if (applicationVersion) {
        result.applicationVersion = applicationVersion;
      }
      if (blackListVersion) {
        result.blackListVersion = blackListVersion;
      }
      if (groups.length > 0) {
        result.groups = groups;
      }
      if (result) {
        logger.debugOut(
          __filename,
          { reportFilter },
          funcIdentifier,
          0
        );
        return resolve(result);
      }

      logger.warn(
        __filename,
        { reportFilter },
        funcIdentifier,
        'DATA_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'DATA_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { reportFilter },
        funcIdentifier,
        err
      );

      return reject({
        statusCode: 500,
        errorDetails: {
          errorCode: 'UNKNOWN_ERROR',
          errorDetails: err.toString(),
        }
      });
    }
  });
};

module.exports = {
  report,
  reportFilter
};

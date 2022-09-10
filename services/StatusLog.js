const StatusLog = require("../models/StatusLog");
const logger = require("../logger");
const Terminal = require("../models/Terminal");
const { LOGS, FILE_TYPE } = require("../constants/index");
const moment = require('moment');
const { isTerminalExist } = require('../utils/CheckExistingTerminal');

const logDetail = (user, action, terminals, comment, fileName) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { logDetail },
    { user, action, terminals, comment, fileName }
  );
  return new Promise(async (resolve, reject) => {
    try {
      const statusLog = await StatusLog.create({
        user,
        action,
        terminals,
        comment,
        fileName
      });
      if (statusLog) {
        logger.debugOut(__filename, { logDetail }, funcIdentifier, 0);
        return resolve(statusLog);
      }
      logger.warn(
        __filename,
        { logDetail },
        funcIdentifier,
        "LOG_DETAIL_NOT_LOGGED"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: "LOG_DETAIL_NOT_LOGGED",
        }
      });
    } catch (err) {
      logger.warn(__filename, { logDetail }, funcIdentifier, err);

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

/* Get all logs/activity details .
    return: all logs details to be sent back to Route.*/
const getLogsByTerminalId = (id) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getLogsByTerminalId },
    { id }
  );

  return new Promise(async (resolve, reject) => {
    try {

      if (!id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_TERMINAL_ID',
          }
        });
      }
      const terminal = await Terminal.findOne({ _id: id }).select('-_id serialNumber');
      const logs = await StatusLog.find({ user: LOGS.SYSTEM, terminals: { $in: [terminal.serialNumber] } });

      if (logs) {
        logger.debugOut(
          __filename,
          { getLogsByTerminalId },
          funcIdentifier,
          0
        );

        return resolve(logs);
      }

      logger.warn(
        __filename,
        { getLogsByTerminalId },
        funcIdentifier,
        'LOGS_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'LOGS_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { getLogsByTerminalId },
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


// get all Log Detail From User's

const getLogsByUser = (user) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getLogsByUser },
    { user }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const logs = await StatusLog.find({ user: { "$ne": LOGS.SYSTEM } });
      if (logs) {
        logger.debugOut(
          __filename,
          { getLogsByUser },
          funcIdentifier,
          0
        );
        return resolve(logs);
      }

      logger.warn(
        __filename,
        { getLogsByUser },
        funcIdentifier,
        'LOGS_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'LOGS_NOT_FOUND',
        }
      });

    } catch (err) {
      logger.warn(
        __filename,
        { getLogsByUser },
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

/*Post download related status and info int terminal model.
    return: download status Response to be sent back to Route.*/
const downloadResponse = (serialNumber, downloadRecordDate, fileName, version, fileType) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { downloadResponse },
    { serialNumber, downloadRecordDate, fileName, version, fileType }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'SERIAL_NUMBER_REQUIRED',
          }
        });
      }
      const data = {
        downloadRecordDate, fileName, version, fileType
      };
      const isTerminalRegistered = await isTerminalExist(serialNumber);
      if (!isTerminalRegistered) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'TERMINAL_NOT_REGISTERED',
          }
        });
      }
      let query = { lastCallDate: new Date() };
      if (fileType === FILE_TYPE.BLACKLIST) {
        query.blVersion = version;
      } else if (fileType === FILE_TYPE.APPLICATION) {
        query.appVersion = version;
      } else if (fileType === FILE_TYPE.KERNEL) {
        query.kernelVersion = version;
      } else if (fileType === FILE_TYPE.OS) {
        query.osVersion = version;
      }
      await Terminal.updateMany({ serialNumber: serialNumber }, query);

      const response = await StatusLog.updateMany({ terminals: { $in: [isTerminalRegistered._id] } }, { $addToSet: { 'downloadHistory': data } });

      if (response) {
        logDetail(LOGS.SYSTEM, LOGS.DOWNLOAD_HISTORY.ACTION, serialNumber, LOGS.DOWNLOAD_HISTORY.COMMENT + ' ' + fileType + ',version ' + version + ',' + moment(downloadRecordDate).format('DD/MM/YYYY hh:mm:ss'), fileName);
        logger.debugOut(
          __filename,
          { downloadResponse },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'RESPONSE_RECORDED' });
      }

      logger.warn(
        __filename,
        { downloadResponse },
        funcIdentifier,
        "RESPONSE_NOT_RECORDED"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'RESPONSE_NOT_RECORDED',

        }
      });
    } catch (err) {
      logger.warn(__filename, { downloadResponse }, funcIdentifier, err);

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
  logDetail,
  getLogsByTerminalId,
  getLogsByUser,
  downloadResponse,
};

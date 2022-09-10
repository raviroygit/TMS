const Logs = require('../models/Logs');
const path = require('path');
const Terminal = require('../models/Terminal');
const logger = require('../logger');
const { logDetail } = require('./StatusLog');
const { LOGS, STATUS } = require('../constants/index');
const fs = require('fs');
const { makeDirectory } = require('../utils/makeDirectory');
const { isTerminalExist } = require('../utils/CheckExistingTerminal');

/* Upload Logs file.
    return: The success or error to be sent back to Route.*/
const uploadLogsFile = (file, serialNumber) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { uploadLogsFile },
    { serialNumber }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        return reject({
          statusCode: 400, errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_FILE'
          }
        });
      }
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_SERIAL_NUMBER'
          }
        });
      };
      const isTerminalRegistered = await isTerminalExist(serialNumber);
      if (!isTerminalRegistered) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'TERMINAL_NOT_REGISTERED'
          }
        });
      }
      // save file in local           
      const name = path.parse(file.name).base;

      const savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, "Logs");
      await makeDirectory(savePath).then(async (x) => {
        await fs.createWriteStream(savePath + '//' + name).write(file.data);
        const logs = await Logs.create({ logsFile: name, terminal: isTerminalRegistered._id });
        if (logs) {
          logger.debugOut(
            __filename,
            { uploadLogsFile },
            funcIdentifier,
            0
          );
          logDetail(LOGS.SYSTEM, LOGS.LOGS_UPLOAD.ACTION, serialNumber, LOGS.LOGS_UPLOAD.COMMENT, name);
          return resolve({ status: true, successCode: 'FILE_SUCCESSFULLY_UPLOADED' });

        }
      }).catch(err => {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'FILE_DIRECTORY_NOT_ABLE_TO_CREATE'
          }
        });
      })



      logger.warn(
        __filename,
        { uploadLogsFile },
        funcIdentifier,
        'FILE_NOT_UPLOADED'
      );

    } catch (err) {
      logger.warn(
        __filename,
        { uploadLogsFile },
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
/* Upload Logs file.
    return: The success or error to be sent back to Route.*/
const getAllLogs = (id) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getAllLogs },
    { id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const logs = await Logs.find({ terminal: id });
      if (logs && logs.length > 0) {
        logger.debugOut(
          __filename,
          { getAllLogs },
          funcIdentifier,
          0
        );
        return resolve(logs);
      }


      logger.warn(
        __filename,
        { getAllLogs },
        funcIdentifier,
        'FILE_NOT_FOUND'
      );
      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: "FILE_NOT_FOUND"
        }
      });

    } catch (err) {
      logger.warn(
        __filename,
        { getAllLogs },
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

/* Download logs file based on input fileName .
    return: The logs file to be sent back to Route.*/
const downloadLogsFile = (id, comment) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { downloadLogsFile },
    { id, comment }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_PROVIDE_VALID_ID',
          }
        });
      }

      const file = await Logs.findOne({ _id: id }).select('-_id logsFile');
      const filePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, "Logs", file.logsFile);
      if (!fs.existsSync(filePath)) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'FILE_NOT_FOUND',
          }
        });
      }
      if (filePath) {
        logger.debugOut(
          __filename,
          { downloadLogsFile },
          funcIdentifier,
          0
        );

        return resolve(filePath);
      }

      logger.warn(
        __filename,
        { downloadLogsFile },
        funcIdentifier,
        'APPLICATION_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'APPLICATION_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { downloadLogsFile },
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

/* Upload Logs file.
    return: The success or error to be sent back to Route.*/
const deleteLogsFile = (id) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { deleteLogsFile },
    { id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_LOGS_FILE_ID',
          }
        });
      }

      const logs = await Logs.deleteOne({ _id: id });

      if (logs) {
        logger.debugOut(
          __filename,
          { deleteLogsFile },
          funcIdentifier,
          0
        );
        return resolve({ status: true, successCode: 'FILE_DELETED' });
      }


      logger.warn(
        __filename,
        { deleteLogsFile },
        funcIdentifier,
        'LOGS_FILE_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'LOGS_FILE_NOT_FOUND',
        }
      });

    } catch (err) {
      logger.warn(
        __filename,
        { deleteLogsFile },
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
  uploadLogsFile,
  getAllLogs,
  downloadLogsFile,
  deleteLogsFile,
};
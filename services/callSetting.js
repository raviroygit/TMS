const callSetting = require('../models/CallSetting');
const logger = require('../logger');
const CallSetting = require('../models/CallSetting');
const Application = require('../models/Application');
const Terminal = require('../models/Terminal');
const { logDetail } = require('./StatusLog');
const { STATUS, LOGS } = require('../constants/index');
const moment = require('moment');
const { isTerminalExist } = require('../utils/CheckExistingTerminal');

/*Schedule call based on input data.
    return: The  success or error to be sent back to Route.*/
const callSchedule = (data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { callSchedule },
    { data }

  );

  return new Promise(async (resolve, reject) => {
    try {
      const { startDateTime, endDateTime, terminalSerialNumber, type, file, executeOn } = data;
      if (!terminalSerialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_TERMINAL_SERIAL_NUMBER',
          }
        });
      }
      if (!type) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_TYPE',
          }
        });
      }
      if (!executeOn) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_FILTER',
          }
        });
      }
      if (!startDateTime || !endDateTime) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'START_AND_END_DATE_TIME_REQUIRED',
          }
        });
      }
      if (startDateTime && endDateTime && terminalSerialNumber && type && executeOn) {
        let query = {
          terminalSerialNumber: {
            $in: terminalSerialNumber
          }
        };
        query.startDateTime = {
          $gte: moment(new Date())
        };
        const findExistingSchedule = await callSetting.find(query);
        if (findExistingSchedule && findExistingSchedule.length > 0) {
          return reject({
            statusCode: 400,
            errorDetails: {
              status: false,
              errorCode: 'CALL_ALREADY_SCHEDULE_WITH_SELECTED_TERMINAL',
            }
          });
        };
        const findAppsVersion= await Application.findOne({name:file}).select('version');
        const scheduleData = await callSetting.create({ version:findAppsVersion.version,startDateTime, endDateTime, terminalSerialNumber, type, file, executeOn });
        if (scheduleData) {
          logger.debugOut(
            __filename,
            { callSchedule },
            funcIdentifier,
            0
          );
          return resolve({ status: true, successCode: 'CALL_SCHEDULE_RECORD_CREATED' })
        }
      }

      logger.warn(
        __filename,
        { callSchedule },
        funcIdentifier,
        'CALL_NOT_SCHEDULE'
      );
      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'CALL_NOT_SCHEDULE',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { callSchedule },
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

/*Reschedule call based on input data.
    return: The  success or error to be sent back to Route.*/
const reschedule = (_id, data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { reschedule },
    {
      _id,
      data
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_CALLSETTING_ID',
          }
        });
      }
      const updated = await callSetting.updateMany({ _id: _id }, data);

      if (updated) {
        logger.debugOut(
          __filename,
          { reschedule },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'CALL_RESCHEDULED' });
      }

      logger.warn(
        __filename,
        { reschedule },
        funcIdentifier,
        'CALL_NOT_RESCHEDULE'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'CALL_NOT_RESCHEDULE',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { reschedule },
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

/*Delete scheduled call based on input data.
    return: The  success or error to be sent back to Route.*/
const deleteCallSchedule = _id => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { deleteCallSchedule },
    { _id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_CALLS_ID',
          }
        });
      }

      const scheduledCall = await callSetting.findOneAndDelete({ _id: _id });
      if (scheduledCall) {
        logger.debugOut(
          __filename,
          { deleteCallSchedule },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'SUCCESSFULLY_DELETED_CALL_SCHEDULED' });
      }

      logger.warn(
        __filename,
        { deleteCallSchedule },
        funcIdentifier,
        'CALL_NOT_DELETED'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'CALL_NOT_DELETED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { deleteCallSchedule },
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

/* Get all scheduled call .
    return: The call scheduled details to be sent back to Route.*/
const CallScheduledList = () => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { CallScheduledList }
  );

  return new Promise(async (resolve, reject) => {
    try {

      const callScheduled = await CallSetting.find().sort({ 'createdAt': -1 });

      if (callScheduled) {
        logger.debugOut(
          __filename,
          { CallScheduledList },
          funcIdentifier,
          0
        );

        return resolve(callScheduled);
      }


      logger.warn(
        __filename,
        { CallScheduledList },
        funcIdentifier,
        'CALL_NOT_SCHEDULE'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'CALL_LIST_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { CallScheduledList },
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

/*Check file version based on serial number  .
    return: The application file version list details to be sent back to Route.*/

const checkAllScheduledFilesForDownloads = (serialNumber, data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { checkAllScheduledFilesForDownloads },
    { serialNumber, data }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_SERIAL_NUMBER',
          }
        });
      }
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
      let query = {
        startDateTime: {
          $gte: new Date(),
          $lte: new Date(new Date().setMinutes(new Date().getMinutes() + 30))
        }
      };
      if (serialNumber) {
        query.terminalSerialNumber = { $in: [serialNumber] };
      }

      if (query) {
        const checkCalls = await CallSetting.findOne(query).select('-_id file startDateTime endDateTime');
        const getLogsUploadPermission = await Terminal.findOne({ serialNumber: serialNumber }).select("-_id isLogsUpload");
        let heartbeatScheduledFile = { status: true, successCode: 'HEART_RESPONSE', isLogsUpload: getLogsUploadPermission.isLogsUpload ? getLogsUploadPermission.isLogsUpload : false };
        heartbeatScheduledFile.data = checkCalls;
        data.status = STATUS.ACTIVATE;
        data.lastCallDate = new Date();
        await Terminal.updateOne({ serialNumber }, data);

        logDetail(LOGS.SYSTEM, LOGS.HEART_BEAT_CALL.ACTION, serialNumber);
        logger.debugOut(
          __filename,
          { checkAllScheduledFilesForDownloads },
          funcIdentifier,
          0
        );

        return resolve(heartbeatScheduledFile);
      }

      logger.warn(
        __filename,
        { checkAllScheduledFilesForDownloads },
        funcIdentifier,
        'NOT_FOUND_ANY_SCHEDULE_FILE'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'NOT_FOUND_ANY_SCHEDULE_FILE',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { checkAllScheduledFilesForDownloads },
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

/*get call based on input id.
    return: The  success or error to be sent back to Route.*/
const getCallById = (id) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getCallById },
    {
      id,
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_CALLSETTING_ID',
          }
        });
      }
      const getCall = await callSetting.findOne({ _id: id });

      if (getCall) {
        logger.debugOut(
          __filename,
          { getCallById },
          funcIdentifier,
          0
        );

        return resolve(getCall);
      }

      logger.warn(
        __filename,
        { getCallById },
        funcIdentifier,
        'CALL_NOT_RESCHEDULE'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'CALL_NOT_RESCHEDULE',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { getCallById },
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
  callSchedule,
  reschedule,
  getCallById,
  deleteCallSchedule,
  CallScheduledList,
  checkAllScheduledFilesForDownloads
};
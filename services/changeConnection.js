const Terminal = require('../models/Terminal');
const logger = require('../logger');
const { STATUS } = require('../constants/index');

/*Change connection based on input data.
    return: The  success or error to be sent back to Route.*/
const setConnection = (serialNumber, statusChange) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { setConnection },
    { serialNumber, statusChange }
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
      if (!statusChange) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_PROVIDE_TERMINAL_STATUS',
          }
        });
      }
      if (serialNumber && statusChange) {
        const Activate = await Terminal.findOneAndUpdate(
          { serialNumber },
          { $set: { status: statusChange } }
        );
        if (Activate) {
          logger.debugOut(
            __filename,
            { setConnection },
            funcIdentifier,
            0
          );
          if (statusChange === STATUS.ACTIVATE) {
            return resolve({ successCode: "CONNECTION_ESTABLISHED", serialNumber: Activate.serialNumber, systemIdentifier: Activate.systemIdentifier });
          } else {
            return resolve({ status: true, successCode: 'CONNECTION_DISCONNECTED' });
          }
        }
      }

      logger.warn(
        __filename,
        { setConnection },
        funcIdentifier,
        'TERMINAL_NOT_REGISTERED'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { setConnection },
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
  setConnection,
};
const Terminal = require('../models/Terminal');
const logger = require('../logger');
const { STATUS, LOGS } = require('../constants/index');
const { logDetail } = require('./StatusLog');

/* Activate Terminal based on input id .
    return: The success or error to be sent back to Route.*/
const callInit = (serialNumber, data, comment) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { callInit },
    {
      serialNumber,
      data,
      comment
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!serialNumber) {
        return reject({
          statusCode: 400, errorDetails: {
            status: false,
            errorCode: 'BAD_REQUEST',
          }
        });
      }
      const activate = await Terminal.find({ serialNumber: serialNumber });
      data.status = STATUS.ACTIVATE;
      data.lastCallDate = new Date();
      if (activate.length > 0) {
        await Terminal.updateMany(
          { _id: activate[0]._id },
          data
        );
        const user = LOGS.SYSTEM;
        const action = LOGS.CALL_INIT.ACTION;
        logDetail(user, action, activate[0].serialNumber, comment);
        logger.debugOut(
          __filename,
          { callInit },
          funcIdentifier,
          0
        );
        return resolve(
          { status: true, successCode: 'CONNECTION_ESTABLISHED', systemIdentifier: activate[0].systemIdentifier, acquirerIPAddress: activate[0].acquirerIPAddress, acquiredPort: activate[0].acquiredPort, TLS: activate[0].TLS }
        );
      }

      logger.warn(
        __filename,
        { callInit },
        funcIdentifier,
        'TERMINAL_NOT_REGISTERED'
      );

      return reject({
        statusCode: 404, errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { callInit },
        funcIdentifier,
        err
      );

      return reject({
        statusCode: 500, errorDetails: {
          errorCode: 'UNKNOWN_ERROR',
          errorDetails: err.toString(),
        }
      });
    }
  });
};

module.exports = {
  callInit,
};
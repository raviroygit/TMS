const Transaction = require('../models/Transaction');
const { isTerminalExist } = require('../utils/CheckExistingTerminal');
const logger = require("../logger");
const Terminal = require('../models/Terminal');

const insertTransaction = (data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { insertTransaction },
    {
      data
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const { serialNumber, systemIdentifier, paymentType, acceptingIssueNumber,
        transactionNumber, transactionAmount, cardHolderNumber, authorizationNumber,
        selectedAID, transactionTVR, transactionStatus, refusingReason, SPDHRefusalCode
      } = data;
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'SERIAL_NUMBER_REQUIRED',
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
      const transactionData = {
        serialNumber,
        systemIdentifier,
        paymentType,
        acceptingIssueNumber,
        transactionNumber,
        transactionAmount,
        cardHolderNumber,
        authorizationNumber,
        selectedAID,
        transactionTVR,
        transactionStatus,
        refusingReason,
        SPDHRefusalCode
      };

      const insertData = await Transaction.create(transactionData);

      if (insertData) {
        await Terminal.updateOne({ serialNumber }, { lastCallDate: new Date() });
        logger.debugOut(
          __filename,
          { insertTransaction },
          funcIdentifier,
          0
        );

        return resolve(
          { status: true, successCode: 'TRANSACTION_SUCCESSFULLY_INSERTED' }
        );
      }

      logger.warn(
        __filename,
        { insertTransaction },
        funcIdentifier,
        "TRANSACTION_FAIL"
      );

      return reject({
        statusCode: 400,
        errorDetails: {
          status: false,
          errorCode: 'TRANSACTION_INSERT_UNSUCCESSFUL',
        }
      });
    } catch (err) {
      logger.warn(__filename, { insertTransaction }, funcIdentifier, err);

      return reject({
        statusCode: 500,
        errorDetails: {
          errorCode: 'UNKNOWN_ERROR',
          errorDetails: err.toString(),
        }
      });
    }
  });
}

const getAllTransactions = () => {
  const funcIdentifier = logger.debugIn(__filename, { getAllTransactions });

  return new Promise(async (resolve, reject) => {
    try {
      const data = await Transaction.find({});

      if (data) {
        logger.debugOut(__filename, { getAllTransactions }, funcIdentifier, 0);

        return resolve(data);
      }

      logger.warn(
        __filename,
        { getAllTransactions },
        funcIdentifier,
        "TRANSACTION_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TRANSACTION_NOT_FOUND',
        }
      });

    } catch (err) {
      logger.warn(__filename, { getAllTransactions }, funcIdentifier, err);

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
  insertTransaction,
  getAllTransactions
};
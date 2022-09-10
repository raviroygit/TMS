const fs = require('fs');
const logger = require('../logger');
const path = require('path');
const crypto = require('crypto');
const { PASSWORDGENERATE } = require('../constants/index');

// Password generator algorithm 
const passwordAlgo = (date, serialNumber) => {
  if (date && serialNumber) {
    let message = `${serialNumber}${date}`;
    let digestedHex = crypto.createHash('sha256').update(Buffer.from(message)).digest('hex');
    let decodedDigit = parseInt(digestedHex.substr(63), 16);
    let decodedPwd = parseInt(digestedHex.substr(2 * decodedDigit, 6), 16);
    let password = decodedPwd % 10000;
    while (password.toString().length < 4) {
      password = '0' + password;
    }
    return password;
  }
}
/* Generate password based on input data.
    return: The Password details to be sent back to Route.*/
const passwordGenerate = (file, rangeStart, rangeEnd, date, type) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { passwordGenerate },
    { rangeStart, rangeEnd, date, type }
  );
  return new Promise(async (resolve, reject) => {
    try {
      if (!date) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'DATE_IS_REQUIRED',
          }
        });
      }
      if (!type) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PASSWORD_TYPE_REQUIRED',
          }
        });
      }
      if (!file && !rangeStart && !rangeEnd) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'RANGE_OF_SERIAL_NUMBER_REQUIRED_OR_PLEASE_SELECT_FILE',
          }
        });
      }
      let allSerialNumber = [];
      if (file) {
        const nameFile = path.parse(file.name).base;
        const filePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, 'Password', `${nameFile}`)
        await file.mv(filePath);
        const fileWithSerialNo = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').split('\n');
        for (let i in fileWithSerialNo) {
          if (fileWithSerialNo[i].length > 6) {
            allSerialNumber.push(fileWithSerialNo[i])
          } else {
            return reject({
              statusCode: 400,
              errorDetails: {
                status: false,
                errorCode: 'ONLY_NUMBER_ACCEPTED_AS_A_SERIAL_NUMBER',
              }
            });
          }

        }
      }

      while (parseInt(rangeStart) <= parseInt(rangeEnd)) {
        let nextSerialNumber = rangeStart++;
        let serialNumberLength = rangeEnd.length - nextSerialNumber.toString().length;
        while ((serialNumberLength) > 0) {
          nextSerialNumber = "0" + nextSerialNumber;
          --serialNumberLength;
        }
        allSerialNumber.push(nextSerialNumber);
      }

      let data = [];
      allSerialNumber.forEach(serialNumber => {
        let superPassword, maintainerPassword;
        type.forEach(i => {
          if (i === PASSWORDGENERATE.SUPER_PASSWORD) {
            superPassword = passwordAlgo(serialNumber, date);
          }
          if (i === PASSWORDGENERATE.MAINTAINER_PASSWORD) {
            maintainerPassword = passwordAlgo(date, serialNumber);
          }
        })
        data.push({ serialNumber, superPassword, maintainerPassword })
      });
      if (data.length > 0) {
        logger.debugOut(
          __filename,
          { passwordGenerate },
          funcIdentifier,
          0
        );
        return resolve(data);
      }


      logger.warn(
        __filename,
        { passwordGenerate },
        funcIdentifier,
        'PASSWORD_NOT_GENERATED'
      );
      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'PASSWORD_NOT_GENERATED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { passwordGenerate },
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
  passwordGenerate
}
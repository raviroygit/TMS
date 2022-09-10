const fs = require('fs');
const path = require('path');
const utils = require('../utils');
const logger = require('../logger');
const terminalService = require('./terminal');

/* Import file of serial number and move to the directory .*/
const importTerminals = sampleFile => {
  const funcIdentifier = logger.debugIn(__filename, { importTerminals }, { sampleFile });

  const file = sampleFile.file;
  return new Promise(async (resolve, reject) => {
    try {
      let uploadedPath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, 'Terminal', `${file.name}`);
      await file.mv(uploadedPath);

      utils.fileSystem.file.readFile(uploadedPath).then(async TerminalsData => {
        if (TerminalsData.length > 0) {
          terminalService.registerByImport(TerminalsData).then(data => {
            return resolve(data);
          }).catch(err => {
            return reject(err);
          });
        } else {
          logger.warn(__filename, { importTerminals }, funcIdentifier, 'EMPTY_FILE');

          return reject({
            statusCode: 404,
            errorDetails: {
              status: false,
              errorCode: 'EMPTY_FILE'
            }
          });
        }
      });
    }
    catch (er) {
      logger.warn(__filename, { importTerminals }, funcIdentifier, er);

      return reject({
        statusCode: 500,
        errorDetails: {
          errorCode: 'UNKNOWN_ERROR',
          errorDetails: er.toString()
        }
      });
    }
  });
};

module.exports = {
  importTerminals
};
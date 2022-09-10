const Application = require('../models/Application');
const logger = require('../logger');
const path = require('path');
const { APPLICATION, LOGS, STATUS } = require('../constants/index');
const { logDetail } = require('./StatusLog');
const Terminal = require('../models/Terminal');
const { makeDirectory } = require('../utils/makeDirectory');
const fs = require('fs');
const { isTerminalExist } = require('../utils/CheckExistingTerminal');
const ApkReader = require('adbkit-apkreader');
const util = require('util');
const { application } = require('express');

/* Upload application file.
    return: The success or error to be sent back to Route.*/
const createApplication = (file, logo, screenShots, type, appType, price, model, businessCategories, description, userName, title, releaseNote) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { createApplication },
    { type, appType, price, model, businessCategories, description, userName, title, releaseNote }
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
      if (!type) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_FILE_TYPE'
          }
        });
      }

      // save file in local           
      if (file) {
        const lastVersion = await Application.findOne({ "type": type, "name": { $regex: file.name } }).sort({ "createdAt": -1 });
        let version = 1;
        if (lastVersion && lastVersion.version && lastVersion.version > 0) {
          version = lastVersion.version + 1
        }
        const name = 'V' + version + '-' + type + '-' + path.parse(file.name).base;
        const savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, type, 'v_' + version);
        await makeDirectory(savePath).then(async (x) => {
          await fs.createWriteStream(savePath + '//' + name).write(file.data);
          let query = { title, name, version, type, appType, price, model, businessCategories, description, developer: userName, releaseNote };
          if (logo) {
            const logoBase64 = logo.data.toString('base64');
            query.logo = logoBase64;
          };
          query.size = file.size / (1024 * 1024);
          if (screenShots && Array.isArray(screenShots)) {
            let screenShotsBase64 = [];
            screenShots.forEach(img => {
              screenShotsBase64.push(img.data.toString('base64'));
            })
            query.screenShots = screenShotsBase64;
          } else if (screenShots) {
            const screenShotsBase64 = screenShots.data.toString('base64');
            query.screenShots = screenShotsBase64;
          };
          
          const application = await Application.create(query);
          if (application) {
            logger.debugOut(
              __filename,
              { createApplication },
              funcIdentifier,
              0
            );
            ApkReader.open(savePath + '/' + name)
              .then(reader => reader.readManifest())
              .then(async(manifest) => {
                const appDetails = JSON.parse(JSON.stringify(manifest));
                if(appDetails.versionName){
                  await Application.updateOne({_id:application._id},{version:appDetails.versionName});
                }
                return resolve({ versionName: appDetails.versionName, versionCode: appDetails.versionCode, compileSdkVersion: appDetails.compileSdkVersion, package: appDetails.package, id: application._id });
              }).catch(err => {
                return reject({
                  statusCode: 400,
                  errorDetails: {
                    status: false,
                    errorCode: 'APP_READING_ERROR'
                  }
                });
              })
          }
        }).catch(error => {
          return reject({
            statusCode: 400,
            errorDetails: {
              status: false,
              errorCode: 'SOMETHINGS_WENT_WRONG'
            }
          });
        });

      }


      logger.warn(
        __filename,
        { createApplication },
        funcIdentifier,
        'APPLICATION_NOT_UPLOADED'
      );

    } catch (err) {
      logger.warn(
        __filename,
        { createApplication },
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

/* Get application files .
    return: The application files details to be sent back to Route.*/
const getAllApplication = () => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getAllApplication }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const application = await Application.find().sort({ 'createdAt': -1 });

      if (application.length > 0) {
        logger.debugOut(
          __filename,
          { getAllApplication },
          funcIdentifier,
          0
        );

        return resolve(application);
      }

      logger.warn(
        __filename,
        { getAllApplication },
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
        { getAllApplication },
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

/* Delete application file based on input data .
    return: The success or error to be sent back to Route.*/
const deleteFileById = _id => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { deleteFileById },
    { _id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_APPLICATION_ID',
          }
        });
      }


      const application = await Application.findOneAndDelete({ _id: _id });
      if (application) {
        const fileName = application.name;
        const splitFile = fileName.split("-");
        const version = splitFile[0].split("V");
        const savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, application.type, 'v_' + version[1], application.name);
        if (fs.access(savePath, err => {
          fs.unlink(savePath, (err) => {
            if (err) {
              return console.error(err);
            }
          })
        }))
          logger.debugOut(
            __filename,
            { deleteFileById },
            funcIdentifier,
            0
          );

        return resolve({ status: true, successCode: 'APPLICATION_SUCCESSFULLY_DELETED' });
      }

      logger.warn(
        __filename,
        { deleteFileById },
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
        { deleteFileById },
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

/* Update application file based on input data .
    return: The success or error to be sent back to Route.*/
const update = (_id, file, data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { update },
    {
      _id,
      data
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        return reject({
          statusCode: 404,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_FILE',
          }
        });
      }
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_APPLICATION_ID',
          }
        });
      }

      const checkTerminal = await Application.findOne({ _id: _id });
      let updated;
      if (file && checkTerminal) {
        const name = 'V' + checkTerminal.version + '-' + checkTerminal.type + '-' + path.parse(file.name).base;
        const savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, checkTerminal.type, 'v_' + checkTerminal.version);
        data.name = name;
        updated = await Application.updateMany({ _id: _id }, data);
        await makeDirectory(savePath).then(async (x) => {
          await fs.createWriteStream(savePath + '//' + name).write(file.data);
          if (updated) {
            logger.debugOut(
              __filename,
              { update },
              funcIdentifier,
              0
            );

            return resolve({ status: true, successCode: 'APPLICATION_SUCCESSFULLY_UPDATED' });
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
      }

      logger.warn(
        __filename,
        { update },
        funcIdentifier,
        'APPLICATION_NOT_UPDATED'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'APPLICATION_NOT_UPDATED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { update },
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


/* Get application file based on input id .
    return: The application file details to be sent back to Route.*/
const getApplicationById = _id => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getApplicationById },
    { _id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_APPLICATION_ID',
          }
        });
      }
      const details = await Application.findOne({
        _id: _id,
      });

      const appName = details.name.replace("V" + `${details.version}` + "-" + `${details.type}` + "-", "");
      const availableVersion = await Application.find({ "type": details.type, "name": { $regex: appName } }).select("version createdAt");

      const result = { ...details._doc, versionList: availableVersion };

      if (result) {
        logger.debugOut(
          __filename,
          { getApplicationById },
          funcIdentifier,
          0
        );

        return resolve(result);
      }

      logger.warn(
        __filename,
        { getApplicationById },
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
        { getApplicationById },
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

/* Download latest application file based on input id .
    return: The application file details to be sent back to Route.*/
const downloadApplication = (serialNumber, fileName, comment, terminals) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { downloadApplication },
    { serialNumber, fileName, comment, terminals }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'SERIAL_NUMBER_IS_REQUIRED',
          }
        });
      }
      if (!fileName) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_FILE',
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

      if (isTerminalRegistered.status !== `${STATUS.ACTIVATE}`) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'TERMINAL_NOT_ACTIVE',
          }
        });
      }
      const extractFileType = fileName.split("-");
      const findVersion = extractFileType[0].split('V');
      const filePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, `${extractFileType[1]}`, 'v_' + `${findVersion[1]}`, `${fileName}`);
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

        await Terminal.updateOne({ serialNumber }, { lastCallDate: new Date() });

        logDetail(LOGS.SYSTEM, APPLICATION.DOWNLOADED, serialNumber, comment, fileName);

        logger.debugOut(
          __filename,
          { downloadApplication },
          funcIdentifier,
          0
        );

        return resolve(filePath);
      }

      logger.warn(
        __filename,
        { downloadApplication },
        funcIdentifier,
        'FILE_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'FILE_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { downloadApplication },
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

/* Get application file based on input Terminal id .
    return: The application file details to be sent back to Route.*/
const getApplicationByTerminalId = _id => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getApplicationByTerminalId },
    { _id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_TERMINAL_ID',
          }
        });
      };

      const result = await Application.find({ terminals: { $in: [_id] } });

      if (result) {
        logger.debugOut(
          __filename,
          { getApplicationByTerminalId },
          funcIdentifier,
          0
        );

        return resolve(result);
      }

      logger.warn(
        __filename,
        { getApplicationByTerminalId },
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
        { getApplicationByTerminalId },
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

/* assign  application to terminal based on input data .
    return: The success or error to be sent back to Route.*/
const assignAppsToTerminal = (data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { assignAppsToTerminal },
    {
      data
    }
  );

  return new Promise(async (resolve, reject) => {
    try {

      if (!data.appsId) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_APPS_ID',
          }
        });
      };

      const appDetails = {
        package: data.package,
        compileSdkVersion: data.compileSdkVersion,
        versionCode: data.versionCode
      };
      if (data && data.version) {
        appDetails.version = parseFloat(data.version)
      };

      console.log(appDetails)
      const assignAppsToTerminal = await Application.updateMany({ _id: { $in: data.appsId } }, appDetails, { upsert: true })
      if (assignAppsToTerminal) {
        logger.debugOut(
          __filename,
          { assignAppsToTerminal },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'APPLICATION_SUCCESSFULLY_ASSIGNED_TO_TERMINAL' });
      }
      logger.warn(
        __filename,
        { assignAppsToTerminal },
        funcIdentifier,
        'APPLICATION_NOT_UPDATED'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'APPLICATION_NOT_UPDATED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { assignAppsToTerminal },
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
  createApplication,
  getAllApplication,
  deleteFileById,
  update,
  getApplicationById,
  downloadApplication,
  getApplicationByTerminalId,
  assignAppsToTerminal
};
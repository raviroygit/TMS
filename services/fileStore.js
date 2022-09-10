const FileStore = require('../models/FileStore');
const logger = require('../logger');
const path = require('path');
const fs = require('fs');
const { FILESTORE, LOGS, STATUS } = require('../constants/index');
const { logDetail } = require('./StatusLog');
const Terminal = require('../models/Terminal');
const { makeDirectory } = require('../utils/makeDirectory');
const { isTerminalExist } = require('../utils/CheckExistingTerminal');

/*Create FileStore based on input data.
    return: The  success or error to be sent back to Route.*/
const createFileStore = (file, type, status, supplier, description) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { createFileStore },
    { type, status, supplier, description }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_SELECT_FILE',
          }
        });
      }
      if (!type) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'FILE_TYPE_REQUIRED',
          }
        });
      }

      let name, savePath, version = 1;

      // save file in local           
      if (type === FILESTORE.BLACKLIST) {
        const latestCreated = await FileStore.findOne({ 'type': type }, { 'version': { $exists: true, $ne: null } }).limit(1).sort({ $natural: -1 }).select('version type');
        if(latestCreated && latestCreated.version){
          version = ++latestCreated.version;
        }
        name = 'V' + `${latestCreated && latestCreated.version ? latestCreated.version : version}` + '-' + `${type}` + '-' + path.parse(file.name).base;
        savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, `${type}`, 'v_' + `${latestCreated && latestCreated.version ? latestCreated.version : version}`);
      } else {
        name = `${type}` + '-' + path.parse(file.name).base;
        savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, `${type}`);
      }
      await makeDirectory(savePath).then(async (x) => {
        await fs.createWriteStream(savePath + '//' + name).write(file.data);
        if (type !== FILESTORE.BLACKLIST) {
          const checkFile = await FileStore.findOne({ type, name });
          if (checkFile) {
            const updated = await FileStore.updateMany({ _id: checkFile._id }, { name, status, supplier, description, base64: file.data.toString('base64') });
            if (updated) {
              return resolve({ status: true, successCode: 'FILE_SUCCESSFULLY_UPLOADED' });
            }
          }
        }

        let data;
        if (type !== FILESTORE.BLACKLIST) {
          data = {
            name, type, status, supplier, description, base64: file.data.toString('base64')
          };
        } else {
          data = {
            name, type, version, status, supplier, description
          };
        }

        const fileStore = await FileStore.create(data);
        logger.debugOut(
          __filename,
          { createFileStore },
          funcIdentifier,
          0
        );
        if (fileStore) {
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
      });


      logger.warn(
        __filename,
        { createFileStore },
        funcIdentifier,
        'FILE_NOT_CREATED. SOMETHING_HAPPEN_WRONG!'
      );

    } catch (err) {
      logger.warn(
        __filename,
        { createFileStore },
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

/*Get list of file based on input data.
    return: The  files details to be sent back to Route.*/
const getFileStoreList = () => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getFileStoreList }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const params = await FileStore.find({ 'type': { $nin: [FILESTORE.BLACKLIST] } }).sort({ 'createdAt': -1 });
      const LatestBlackList = await FileStore.findOne({ 'type': FILESTORE.BLACKLIST }).sort({ 'createdAt': -1 });

      if (params && LatestBlackList) {
        params.push(LatestBlackList);
      }
      if (params.length > 0) {
        logger.debugOut(
          __filename,
          { getFileStoreList },
          funcIdentifier,
          0
        );

        return resolve(params);
      }

      logger.warn(
        __filename,
        { getFileStoreList },
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
        { getFileStoreList },
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

/*Get FileStore based on input id.
    return: The  files details to be sent back to Route.*/
const getFilStoreById = _id => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getFilStoreById },
    { _id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_FILE_ID',
          }
        });
      }
      const searchResult = FileStore.findById({
        _id: _id,
      });

      const result = await searchResult;

      if (result) {
        logger.debugOut(
          __filename,
          { getFilStoreById },
          funcIdentifier,
          0
        );

        return resolve(result);
      }

      logger.warn(
        __filename,
        { getFilStoreById },
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
        { getFilStoreById },
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

/*Delete file from FileStore based on input data.
    return: The  success or error to be sent back to Route.*/
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
            errorCode: 'INVALID_FILE_ID',
          }
        });
      }
      const file = await FileStore.findOneAndDelete({ _id: _id });

      if (file) {
        logger.debugOut(
          __filename,
          { deleteFileById },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'FILE_SUCCESSFULLY_DELETED' });
      }

      logger.warn(
        __filename,
        { deleteFileById },
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

/*Update file from FileStore based on input data.
    return: The  success or error to be sent back to Route.*/
const update = (_id, status, file) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { update },
    {
      _id, status
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
            errorCode: 'INVALID_FILE_ID',
          }
        });
      }
      if (file && _id) {
        let name, savePath;

        // check type and version for path making 
        const check = await FileStore.findOne({ _id: _id });
        if (`${check.type}` === FILESTORE.BLACKLIST) {
          name = 'V' + `${check.version}` + '-' + `${check.type}` + '-' + path.parse(file.name).base;
          savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, `${check.type}`, 'v_' + `${check.version}`);
        } else {
          name = `${check.type}` + '-' + path.parse(file.name).base;
          savePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, `${check.type}`);
        }
        await makeDirectory(savePath).then(async (x) => {
          const data = { status, name };
          if (check.type !== FILESTORE.BLACKLIST) {
            data.base64 = file.data.toString('base64');
          }
          await fs.createWriteStream(savePath + '//' + name).write(file.data);
          const updated = await FileStore.updateOne({ _id: _id }, data);
          if (updated) {
            logger.debugOut(
              __filename,
              { update },
              funcIdentifier,
              0
            );

            return resolve({ status: 'success', successCode: 'FILE_SUCCESSFULLY_UPDATED' });
          }
        }).catch(error => {
          return reject({
            statusCode: 400,
            errorDetails: {
              status: false,
              errorCode: 'FILE_DIRECTORY_NOT_ABLE_TO_CREATE'
            }
          });
        });
      }
      logger.warn(
        __filename,
        { update },
        funcIdentifier,
        'FILE_NOT_UPDATED'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'FILE_NOT_UPDATED',
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

/* Download Blacklist based on input data.
    return: The  downloadable file to be sent back to Route.*/
const downloadBlacklist = (serialNumber, comment) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { downloadBlacklist },
    { serialNumber, comment }
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

      const lastCreatedBlackList = await FileStore.findOne({ 'type': FILESTORE.BLACKLIST }).sort({ 'createdAt': -1 });
      let filePath
      if (lastCreatedBlackList) {
        filePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, FILESTORE.BLACKLIST, 'v_' + `${lastCreatedBlackList.version}`, `${lastCreatedBlackList.name}`);
      }

      if (filePath) {
        await Terminal.updateOne({ serialNumber }, { lastCallDate: new Date() });
        logDetail(LOGS.SYSTEM, LOGS.DOWNLOAD_BLACKLIST.ACTION, serialNumber, comment, lastCreatedBlackList.name);
        logger.debugOut(
          __filename,
          { downloadBlacklist },
          funcIdentifier,
          0
        );

        return resolve(filePath);
      }


      logger.warn(
        __filename,
        { downloadBlacklist },
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
        { downloadBlacklist },
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
}

/* Download Blacklist parameter file based on input id,type.
    return: The  downloadable file to be sent back to Route.*/
const downloadBlacklistParam = (id, comment) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { downloadBlacklistParam },
    { id, comment }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'FILE_ID_IS_REQUIRED',
          }
        });
      }
      const fileInfo = await FileStore.findOne({ _id: id });

      if (fileInfo) {
        let filePath;
        if (fileInfo.type === FILESTORE.BLACKLIST) {
          filePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, FILESTORE.BLACKLIST, 'v_' + fileInfo.version, fileInfo.name);
        } else {
          filePath = path.join(__dirname, '..' + `${process.env.UPLOAD_PATH}`, fileInfo.type, fileInfo.name);
        }

        logger.debugOut(
          __filename,
          { downloadBlacklistParam },
          funcIdentifier,
          0
        );

        return resolve(filePath);
      }




      logger.warn(
        __filename,
        { downloadBlacklistParam },
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
        { downloadBlacklistParam },
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
}
module.exports = {
  createFileStore,
  getFileStoreList,
  getFilStoreById,
  deleteFileById,
  update,
  downloadBlacklist,
  downloadBlacklistParam
};

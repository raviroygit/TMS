const logger = require('../logger');
const FileStore = require('../models/FileStore');
const Application = require('../models/Application');

const checkVersion = () => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { checkVersion },
  );

  return new Promise(async (resolve, reject) => {
    try {
      const latestApplicationVersion = await Application.find({
        $or: [
          { type: { $in: ["Application", "Kernel", "OS"] } }
        ]
      }).select('-_id type version').sort({ "createdAt": -1 });
      let result = {};
      if (latestApplicationVersion) {
        const applicationVersion = [], kernelVersion = [], OSversion = [];
        for (let x = 0; x <= latestApplicationVersion.length; x++) {
          if (latestApplicationVersion[x] && latestApplicationVersion[x].type === "Application" && latestApplicationVersion[x].version) {
            applicationVersion.push(latestApplicationVersion[x].version);
          }
          if (latestApplicationVersion[x] && latestApplicationVersion[x].type === "Kernel" && latestApplicationVersion[x].version) {
            kernelVersion.push(latestApplicationVersion[x].version);
          }
          if (latestApplicationVersion[x] && latestApplicationVersion[x].type === "OS" && latestApplicationVersion[x].version) {
            OSversion.push(latestApplicationVersion[x].version);
          }

        }
        result.latestApplicationVersion = Math.max(...applicationVersion);
        result.latestKernelVersion = Math.max(...kernelVersion);
        result.latestOSversion = Math.max(...OSversion);
      }

      if (result) {
        logger.debugOut(
          __filename,
          { checkVersion },
          funcIdentifier,
          0
        );
        return resolve(result);
      }

      logger.warn(
        __filename,
        { checkVersion },
        funcIdentifier,
        'DATA_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'DATA_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { checkVersion },
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
  checkVersion
};
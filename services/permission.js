const Permission = require('../models/Permission');
const logger = require('../logger');

/* create permission.
    return: The success or error to be sent back to Route.*/
const permission = (role, features, route) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { permission },
    { role, features, route }
  );
  return new Promise(async (resolve, reject) => {
    try {

      const permissionData = await Permission.create({ role, features, route });

      if (permissionData) {
        logger.debugOut(
          __filename,
          { permission },
          funcIdentifier,
          0
        );
        return resolve({ status: true, successCode: 'PERMISSION_DATA_RECORDED' });
      }

      logger.warn(
        __filename,
        { permission },
        funcIdentifier,
        "PERMISSION_NOT_RECORDED"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: "PERMISSION_NOT_RECORDED",
        }
      });
    } catch (err) {
      logger.warn(__filename, { permission }, funcIdentifier, err);

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

/* update permission.
    return: The success or error to be sent back to Route.*/
const updatePermission = (role, data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { updatePermission },
    { role, data }
  );
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};
      if (data.features && data.features.length > 0) {
        query.features = data.features
      }
      if (data.route && data.route.length > 0) {
        query.route = data.route;
      }
      const updatePermissionByRole = await Permission.updateMany({ role }, query, { upsert: true });

      if (updatePermissionByRole) {
        logger.debugOut(
          __filename,
          { updatePermission },
          funcIdentifier,
          0
        );
        return resolve({ status: true, successCode: 'PERMISSION_DATA_RECORDED' });
      }

      logger.warn(
        __filename,
        { updatePermission },
        funcIdentifier,
        "PERMISSION_NOT_RECORDED"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: "PERMISSION_NOT_RECORDED",
        }
      });
    } catch (err) {
      logger.warn(__filename, { updatePermission }, funcIdentifier, err);

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
const getPermissionByRole = (role) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getPermissionByRole },
    { role }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!role) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_ROLE',
          }
        });
      }
      const getPermission = await Permission.findOne({ role });
      if (getPermission) {
        logger.debugOut(
          __filename,
          { getPermissionByRole },
          funcIdentifier,
          0
        );

        return resolve(getPermission);
      }

      logger.warn(
        __filename,
        { getPermissionByRole },
        funcIdentifier,
        'PERMISSION_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'PERMISSION_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { getPermissionByRole },
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
  permission,
  updatePermission,
  getPermissionByRole,
};

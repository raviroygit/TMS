const Merchant = require('../models/Group');
const logger = require('../logger');
const Terminal = require('../models/Terminal');
const { findOneAndDelete } = require('../models/Group');
const { logDetail } = require("./StatusLog");
const { LOGS } = require("../constants/index");

/* Register Group based on input data.
    return: The success or error to be sent back to Route.*/
const merchantRegister = (data, user) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { merchantRegister },
    {
      data, user
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const { merchantName, streetAddress, groupType, city, state, country, terminal, subGroup, parameterFile, isParent } = data;
      const groupData = {
        merchantName,
        streetAddress,
        groupType,
        city,
        state,
        country,
        terminal,
        isParent
      };
      const paramFile = parameterFile ? parameterFile : "";
      if (!merchantName) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'GROUP_NAME_REQUIRED',
          }
        });
      }

      const checkExistMerchant = await Merchant.findOne({ merchantName });
      if (checkExistMerchant) {
        return reject({
          statusCode: 500,
          errorDetails: {
            status: false,
            errorCode: 'GROUP_OR_SUB_GROUP_NAME_SHOULD_BE_UNIQUE',
          }
        });
      }
      const register = await Merchant.create(groupData);
      const action = isParent ? LOGS.GROUP_CREATED.ACTION_GROUP : LOGS.GROUP_CREATED.ACTION_SUB_GROUP;
      logDetail(user.name, action, merchantName);
      if (register) {
        if (subGroup && subGroup.length > 0) {
          let subGroupId = [], id;
          if (!isParent) {
            if (paramFile) {
              await Merchant.updateOne({ _id: register._id }, { $set: { parameterFile: paramFile } });
            }
            subGroupId.push(register._id);
            id = subGroup;
          } else {
            subGroupId = subGroup;
            id = register._id;
          }
          if (id) {
            await Merchant.updateMany({ _id: { $in: id } }, { $addToSet: { subGroup: subGroupId } });
          }
        }
        logger.debugOut(
          __filename,
          { merchantRegister },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'GROUP_REGISTRATION_SUCCESSFUL' });
      }

      logger.warn(
        __filename,
        { merchantRegister },
        funcIdentifier,
        'GROUP_NOT_REGISTERED'
      );

      return reject({
        statusCode: 400,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { merchantRegister },
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

/* Get all group lis .
    return: The group details to be sent back to Route.*/
const getMerchantList = (groupName, isParent) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getMerchantList },
    { groupName, isParent }
  );

  return new Promise(async (resolve, reject) => {
    try {
      let query = { isParent };
      if (groupName) {
        query.merchantName = groupName
      }
      const merchants = await Merchant.find(query)
        .populate('terminal', '_id terminalModel createdAt merchantName streetAddress  city state country serialNumber systemIdentifier acquirerIPAddress acquiredPort status terminalStoreId')
        .populate('subGroup', '_id isParent terminal merchantName subGroup streetAddress groupType city state country createdAt updatedAt')
        .sort({ 'createdAt': -1 });

      if (merchants.length > 0) {
        logger.debugOut(
          __filename,
          { getMerchantList },
          funcIdentifier,
          0
        );

        return resolve(merchants);
      }


      logger.warn(
        __filename,
        { getMerchantList },
        funcIdentifier,
        'GROUP_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { getMerchantList },
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


/*Update Group based on input data.
    return: The  success or error to be sent back to Route.*/
const update = (_id, terminal, subGroup, data, user) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { update },
    {
      _id,
      terminal, subGroup,
      data, user
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_GROUP_ID',
          }
        });
      }
      if (!data.parameterFile) {
        delete data.parameterFile
      }
      let updated =
        await Merchant.updateMany(
          { _id: _id },
          data,
          { $addToSet: { 'terminal': terminal } }
        );
      const action = data.groupType === LOGS.GROUP_UPDATE.BANK ? LOGS.GROUP_UPDATE.ACTION_GROUP : LOGS.GROUP_UPDATE.ACTION_SUB_GROUP;
      logDetail(user.name, action, data.merchantName);
      if (updated) {
        logger.debugOut(
          __filename,
          { update },
          funcIdentifier,
          0
        );

        return resolve({ status: 'success', successCode: 'GROUP_DETAILS_SUCCESSFUL_UPDATED' });
      }

      logger.warn(
        __filename,
        { update },
        funcIdentifier,
        'GROUP_DETAILS_NOT_UPDATED'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_DETAILS_NOT_UPDATED',
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

/*Assign terminal to Group based on input data.
    return: The  success or error to be sent back to Route.*/
const assignTerminal = (serialNumber, merchantName) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { assignTerminal },
    { serialNumber, merchantName }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_PROVIDE_SERIAL_NUMBER',
          }
        });
      }
      if (!merchantName) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'GROUP_NAME_REQUIRED',
          }
        });
      }
      const acceptType = typeof (serialNumber);

      const SearchResult = await Terminal.find({
        serialNumber
      });

      let assign;

      if (acceptType === 'object' && SearchResult.length > 0) {
        assign = await Merchant.updateOne({ merchantName }, { $addToSet: { 'terminal': SearchResult } });
      }

      if (assign) {
        logger.debugOut(
          __filename,
          { assignTerminal },
          funcIdentifier,
          'SERIAL_NUMBER_EXIST'
        );

        return resolve({ status: true, successCode: `TERMINAL_ASSIGNED_TO_${merchantName}`.toUpperCase() });
      }

      logger.warn(
        __filename,
        { assignTerminal },
        funcIdentifier,
        'GROUP_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_DOES_NOT_EXIST',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { assignTerminal },
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


/*Get group details based on input group name.
    return: The  group details to be sent back to Route.*/
const getMerchantByName = merchantName => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getMerchantList },
    { getMerchantByName }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!merchantName) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'GROUP_NAME_REQUIRED',
          }
        });
      }
      const merchants = await Merchant.findOne({ merchantName })
        .populate('terminal', '_id  terminalModel createdAt merchantName streetAddress  city state country serialNumber systemIdentifier acquirerIPAddress acquiredPort status terminalStoreId').populate('subGroup', '_id merchantName streetAddress  city state country')
      if (merchants) {
        logger.debugOut(
          __filename,
          { getMerchantByName },
          funcIdentifier,
          0
        );

        return resolve(merchants);
      }

      logger.warn(
        __filename,
        { getMerchantByName },
        funcIdentifier,
        'GROUP_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { getMerchantByName },
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

/*Get group details based on input id.
    return: The  group details to be sent back to Route.*/
const getMerchantById = _id => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { getMerchantById },
    { _id }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_MERCHANT_ID',
          }
        });
      }
      const merchant = await Merchant.findOne({ _id: _id }).populate('terminal', '_id createdAt terminalModel merchantName streetAddress  city state country serialNumber systemIdentifier acquirerIPAddress acquiredPort status terminalStoreId')
        .populate('subGroup', '_id terminal subGroup merchantName streetAddress  city state country ')

      if (merchant) {
        logger.debugOut(
          __filename,
          { getMerchantById },
          funcIdentifier,
          0
        );

        return resolve(merchant);
      }

      logger.warn(
        __filename,
        { getMerchantById },
        funcIdentifier,
        'GROUP_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { getMerchantById },
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


/*Delete Group based on input group name.
    return: The  success or error to be sent back to Route.*/
const deleteMerchantById = (_id, user) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { deleteMerchantById },
    { _id, user }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_MERCHANT_ID',
          }
        });
      }
      const group = await Merchant.findOne({ _id }).select('-_id subGroup merchantName');
      const groupSubGroupId = group.subGroup;
      groupSubGroupId.push(_id);
      const action = LOGS.GROUP_DELETE.ACTION;
      logDetail(user.name, action, group.merchantName);
      const groupDeleted = await Merchant.deleteMany({ _id: { $in: groupSubGroupId } });
      if (groupDeleted.deletedCount > 0 && groupDeleted.n > 0) {
        await Merchant.updateMany({ $pullAll: { 'subGroup': [_id] } });
        logger.debugOut(
          __filename,
          { deleteMerchantById },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'SUCCESSFULLY_MERCHANT_DELETED' });
      }

      logger.warn(
        __filename,
        { deleteMerchantById },
        funcIdentifier,
        'GROUP_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { deleteMerchantById },
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

/*Get group details based on input id.
    return: The  group details to be sent back to Route.*/
const groupList = () => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { groupList },
    0
  );

  return new Promise(async (resolve, reject) => {
    try {
      const allGroupList = await Merchant.find()
        .populate('terminal', '_id createdAt terminalModel merchantName streetAddress  city state country serialNumber systemIdentifier acquirerIPAddress acquiredPort status terminalStoreId')
        .populate('subGroup', '_id terminal subGroup merchantName streetAddress  city state country ')

      if (allGroupList.length > 0) {
        logger.debugOut(
          __filename,
          { groupList },
          funcIdentifier,
          0
        );

        return resolve(allGroupList);
      }

      logger.warn(
        __filename,
        { groupList },
        funcIdentifier,
        'GROUP_NOT_FOUND'
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'GROUP_NOT_FOUND',
        }
      });
    } catch (err) {
      logger.warn(
        __filename,
        { groupList },
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
  merchantRegister,
  getMerchantList,
  update,
  assignTerminal,
  getMerchantByName,
  getMerchantById,
  deleteMerchantById,
  groupList
};
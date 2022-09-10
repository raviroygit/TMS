const Terminal = require("../models/Terminal");
const Merchant = require('../models/Group');
const logger = require("../logger");
const FileStore = require("../models/FileStore");
const fs = require("fs");
const { TERMINAL, LOGS, STATUS } = require("../constants/index");
const Group = require("../models/Group");
const { logDetail } = require("./StatusLog");

/* Register Terminal based on passed input data.
    return: The Success or Error Response to be sent back to Route.*/
const register = (data) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { register },
    {
      data
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      const { serialNumber, systemIdentifier, acquirerIPAddress, acquiredPort, TLS,
        type, osVersion, kernelVersion, appVersion, terminalModel, ram, diskSpace,
        manufacturer, operatorName, apn, simSerialNo, groups, latitude, longitude } = data;
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'SERIAL_NUMBER_REQUIRED',
          }
        });
      }
      const terminalData = {
        serialNumber,
        systemIdentifier,
        acquirerIPAddress,
        acquiredPort,
        TLS,
        type,
        osVersion, kernelVersion, appVersion, terminalModel, ram, diskSpace,
        manufacturer, operatorName, apn, simSerialNo, latitude, longitude
      };
      const checkExistTerminal = await Terminal.findOne({ serialNumber });
      if (checkExistTerminal) {
        return reject({
          statusCode: 500,
          errorDetails: {
            status: false,
            errorCode: 'SERIAL_NUMBER_SHOULD_BE_UNIQUE',
          }
        });
      }
      const insertData = await Terminal.create(terminalData);

      if (insertData) {

        await Group.updateMany({ merchantName: { $in: groups } }, { $addToSet: { 'terminal': insertData._id } });

        logger.debugOut(
          __filename,
          { register },
          funcIdentifier,
          0
        );

        return resolve(
          { status: true, successCode: 'TERMINAL_SUCCESSFULLY_REGISTERED' }
        );
      }

      logger.warn(
        __filename,
        { register },
        funcIdentifier,
        "TERMINAL_NOT_REGISTERED"
      );

      return reject({
        statusCode: 400,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_REGISTRATION_UNSUCCESSFUL',
        }
      });
    } catch (err) {
      logger.warn(__filename, { register }, funcIdentifier, err);

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

/* Register Terminal based on input file.
    return: The Success or Error Response to be sent back to Route.*/
const registerByImport = (terminals) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { registerByImport },
    { terminalData: terminals }
  );

  return new Promise(async (resolve, reject) => {
    try {
      allTerminals = JSON.parse(JSON.stringify(terminals));
      terminals = []
      allTerminals.forEach(function (item) {
        let terminalMatch = terminals.findIndex(eachItem => eachItem.serialNumber == item.serialNumber);
        if (terminalMatch <= -1) {
          terminals.push(item);
        }
      });
      const TerminalsToInsert = [];
      for (let index = 0; index < terminals.length; index++) {
        if (
          terminals[index]["serialNumber"] &&
          terminals[index]["systemIdentifier"] &&
          terminals[index]["acquirerIPAddress"] &&
          terminals[index]["acquiredPort"]
        ) {
          const check = { serialNumber: terminals[index]["serialNumber"] };

          const duplicateTerminal = await Terminal.findOne(check).select(
            "serialNumber -_id"
          );

          if (duplicateTerminal === null && terminals[index]["serialNumber"]) {
            const condition =
              terminals[index]["serialNumber"].trim() &&
              terminals[index]["systemIdentifier"].trim() &&
              terminals[index]["acquirerIPAddress"].trim() &&
              terminals[index]["acquiredPort"].trim();

            if (condition) {
              const oneRow = {
                serialNumber: terminals[index]["serialNumber"],
                systemIdentifier: terminals[index]["systemIdentifier"],
                acquirerIPAddress: terminals[index]["acquirerIPAddress"],
                acquiredPort: terminals[index]["acquiredPort"],
                TLS: terminals[index]["TLS"],
              };

              TerminalsToInsert.push(oneRow);
            } else {
              logger.debugOut(
                __filename,
                { registerByImport },
                funcIdentifier,
                "REQUIRED_FIELD_MISSING"
              );
            }
          }
        } else {
          return reject({
            statusCode: 400,
            errorDetails: {
              status: false,
              errorCode: 'REQUIRED_FIELD_MISSING',
            }
          });
        }
      }

      const insertedData = await Terminal.insertMany(TerminalsToInsert);

      const afterInserted = insertedData.length;

      const beforeInserted = TerminalsToInsert.length;

      if (insertedData.length > 0) {
        logger.debugOut(__filename, { registerByImport }, funcIdentifier, {
          status: true,
          Total_data: afterInserted,
          Total_inserted: beforeInserted,
        });

        return resolve({
          status: true,
          Total_data: afterInserted,
          Total_inserted: beforeInserted,
        });
      }

      logger.warn(
        __filename,
        { registerByImport },
        funcIdentifier,
        "TERMINAL_SHOULD_BE_UNIQUE"
      );

      return reject({
        statusCode: 400,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_SHOULD_BE_UNIQUE',
        }
      });
    } catch (err) {
      logger.warn(__filename, { registerByImport }, funcIdentifier, err);

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

/* Get all Terminal details.
    return: The terminalList Response to be sent back to Route.*/
const getAllTerminals = (groupName) => {
  const funcIdentifier = logger.debugIn(__filename, { getAllTerminals }, { groupName });

  return new Promise(async (resolve, reject) => {
    try {
      let query = {};
      if (groupName) {
        const groupTerminals = await Group.find({ merchantName: groupName });
        query._id = { $in: groupTerminals && groupTerminals.length > 0 ? groupTerminals[0].terminal : [] };
      }
      const terminals = await Terminal.find(query);

      if (terminals && terminals.length > 0) {
        logger.debugOut(__filename, { getAllTerminals }, funcIdentifier, 0);

        return resolve(terminals);
      }

      logger.warn(
        __filename,
        { getAllTerminals },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_FOUND',
        }
      });

    } catch (err) {
      logger.warn(__filename, { getAllTerminals }, funcIdentifier, err);

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

/* Update Terminal based on passed input data.
    return: The Success or Error Response to be sent back to Route.*/
const updateTerminal = (ids, groups, data, comment, action) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { updateTerminal },
    {
      ids,
      groups,
      data,
      comment,
      action
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!ids) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_TERMINAL_ID',
          }
        });
      }

      const newData = { ...data };
      const excludeFields = ['groups'];
      excludeFields.forEach(el => delete newData[el]);
      newData.group = data.groups[0];
      newData.subGroup = data.groups[1];
      const updatedTerminal = await Terminal.updateMany({ _id: { $in: ids } }, newData);
      if (updatedTerminal) {
        if (data.groups && data.groups.length > 0) {
          await Group.updateMany({ $pullAll: { 'terminal': ids } });
          await Group.updateMany({ merchantName: { $in: data.groups } }, { $addToSet: { 'terminal': ids } });
        }
        const terminalsSerialNumber = await Terminal.find({ _id: ids }, 'serialNumber');
        const user = LOGS.USER;
        const loggedTerminals = terminalsSerialNumber.map(el => el.serialNumber);
        let updateAction;
        if (!action) {
          updateAction = LOGS.TERMINAL_UPDATE.ACTION;
        } else {
          updateAction = action;
        }
        logDetail(user, updateAction, loggedTerminals, comment);
        logger.debugOut(
          __filename,
          { updateTerminal },
          funcIdentifier,
          0
        );

        return resolve({ status: 'success', successCode: 'TERMINAL_SUCCESSFULLY_UPDATED' });
      }
      logger.warn(
        __filename,
        { updateTerminal },
        funcIdentifier,
        "TERMINAL_NOT_UPDATED"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_UPDATED',
        }
      });
    } catch (err) {
      logger.warn(__filename, { updateTerminal }, funcIdentifier, err);

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

// for deleting terminal
const deleteTerminal = (user, ids, terminals, comment) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { deleteTerminal },
    { user, ids, terminals, comment }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!ids && !ids.length > 0) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_TERMINAL_ID',
          }
        });
      }

      const terminalsSerialNumber = await Terminal.find({ _id: ids }, 'serialNumber');
      const terminal = await Terminal.deleteMany({ _id: { $in: ids } });
      if (terminal) {
        await Group.updateMany({ $pull: { terminal: { $in: ids } } });
        const action = LOGS.TERMINAL_DELETE.ACTION;
        const loggedTerminals = terminalsSerialNumber.map(el => el.serialNumber);
        logDetail(user.name, action, loggedTerminals, comment);
        logger.debugOut(
          __filename,
          { deleteTerminal },
          funcIdentifier,
          0
        );

        return resolve({ status: true, successCode: 'TERMINAL_SUCCESSFULLY_DELETED' });
      }

      logger.warn(
        __filename,
        { deleteTerminal },
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
      logger.warn(__filename, { deleteTerminal }, funcIdentifier, err);

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

/*Get Terminal based on passed input id.
    return: The terminal details Response to be sent back to Route.*/
const terminalById = (_id) => {
  const funcIdentifier = logger.debugIn(__filename, { terminalById }, { _id });

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
      }

      const byId = await Terminal.findOne({ _id: _id });
      const groupById = await Merchant.find({ terminal: _id });
      let allData = { ...byId._doc, group: "", subGroup: "" };
      if (groupById[0] && groupById[0].merchantName) {
        allData.group = groupById[0].merchantName;
      }
      if (groupById[1] && groupById[1].merchantName) {
        allData.subGroup = groupById[1].merchantName;
      }

      if (allData) {
        logger.debugOut(
          __filename,
          { terminalById },
          funcIdentifier,
          0
        );

        return resolve(allData);
      }

      logger.warn(
        __filename,
        { terminalById },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(__filename, { terminalById }, funcIdentifier, err);

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

/*Search terminal based on passed input Serial number.
    return: The terminal details Response to be sent back to Route.*/
const searchBySerialNumber = (serialNumber) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { searchBySerialNumber },
    { serialNumber }
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

      const searchResult = await Terminal.find({
        serialNumber,
      });

      if (searchResult.length > 0) {
        logger.debugOut(
          __filename,
          { searchBySerialNumber },
          funcIdentifier,
          0
        );

        return resolve(searchResult[0]);
      }

      logger.warn(
        __filename,
        { searchBySerialNumber },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(__filename, { searchBySerialNumber }, funcIdentifier, err);

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

/*Search terminal based on passed input id.
    return: The terminal details Response to be sent back to Route.*/
const searchById = (_id) => {
  const funcIdentifier = logger.debugIn(__filename, { searchById }, { _id });

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
      }

      const searchResult = Terminal.findOne({
        _id: _id,
      });

      const result = await searchResult;

      if (result) {
        logger.debugOut(
          __filename,
          { searchById },
          funcIdentifier,
          0
        );

        return resolve(result);
      }
      logger.warn(
        __filename,
        { searchById },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(__filename, { searchById }, funcIdentifier, err);

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

/*Download Parameter Files based on passed input data.
    return: The downloadable parameter file Response to be sent back to Route.*/
const downloadParams = (
  serialNumber,
  systemIdentifier,
  data
) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { downloadParams },
    { serialNumber, systemIdentifier, data }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!serialNumber) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'SERIAL_NUMBER_REQUIRED',
          }
        });
      }
      if (!systemIdentifier) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'SYSTEM_IDENTIFIER_REQUIRED',
          }
        });
      }

      const terminal = await Terminal.find({ serialNumber, systemIdentifier });
      if (terminal && terminal.length > 0 && terminal[0].status !== `${STATUS.ACTIVATE}`) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'TERMINAL_NOT_ACTIVE',
          }
        });
      }
      let Files, lastCreatedBlackList;
      if (terminal && terminal.length > 0) {
        const findParameterFile = await Group.findOne({ terminal: { $in: [terminal[0]._id] }, isParent: false });
        if (findParameterFile && findParameterFile.parameterFile) {
          Files = await FileStore.find({ _id: { $in: findParameterFile.parameterFile } });

          if (Files && Files.length > 0) {
            logDetail(LOGS.SYSTEM, LOGS.PARAMS_FILE_DOWNLOAD.ACTION, serialNumber, data.comment, Files[0].name);
          }

        }


        data.lastCallDate = new Date();
        await Terminal.updateMany({ _id: terminal[0]._id }, data);
        lastCreatedBlackList = await FileStore.findOne({ 'type': TERMINAL.BLACKLIST }).sort({ 'createdAt': -1 });
        logger.debugOut(
          __filename,
          { downloadParams },
          funcIdentifier,
          0
        );
        return resolve({ status: true, successCode: 'PARAMETER_FILE_DOWNLOADED', blackList_Version: lastCreatedBlackList && lastCreatedBlackList.version ? lastCreatedBlackList.version : null, file: Files && Files.length > 0 ? Files[0].base64 : '' });

      }


      logger.warn(
        __filename,
        { downloadParams },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_REGISTERED',
        }
      });
    } catch (err) {
      logger.warn(__filename, { downloadParams }, funcIdentifier, err);

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


/* Activate Deactivate Terminal based on input id .
    return: The success or error to be sent back to Route.*/
const activateDeactivateTerminal = (user, Ids, status, terminals, comment) => {
  const funcIdentifier = logger.debugIn(
    __filename,
    { activateDeactivateTerminal },
    {
      user,
      Ids,
      status,
      terminals,
      comment,
    }
  );

  return new Promise(async (resolve, reject) => {
    try {
      if (!Ids) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'INVALID_TERMINAL_IDS',
          }
        });
      }
      if (!status) {
        return reject({
          statusCode: 400,
          errorDetails: {
            status: false,
            errorCode: 'PLEASE_PROVIDE_TERMINAL_VALID_STATUS',
          }
        });
      }
      if (status && Ids && Ids.length > 0) {
        const statusChange = await Terminal.updateMany({ _id: { $in: Ids } }, { $set: { status: status } });
        const terminalsSerialNumber = await Terminal.find({ _id: Ids }, 'serialNumber');
        if (statusChange) {
          let action = '';
          if (status === STATUS.ACTIVATE) {
            action = LOGS.TERMINAL_STATUS_CHANGE.ACTIVE;
          } else {
            action = LOGS.TERMINAL_STATUS_CHANGE.PASSIVE;
          }
          const loggedTerminals = terminalsSerialNumber.map(el => el.serialNumber);
          logDetail(user.name, action, loggedTerminals, comment);
        }
        logger.debugOut(
          __filename,
          { activateDeactivateTerminal },
          funcIdentifier,
          0
        );
        return resolve({ status: true, successCode: `SUCCESSFULLY_CHANGE_TERMINAL_STATUS_TO_${status}`.toUpperCase() });
      }

      logger.warn(
        __filename,
        { activateDeactivateTerminal },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
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
        { activateDeactivateTerminal },
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

/* Get all Terminal SerialNumber and id.*/
const terminalSerialDetail = () => {
  const funcIdentifier = logger.debugIn(__filename, { terminalSerialDetail });

  return new Promise(async (resolve, reject) => {
    try {
      const data = await Terminal.find({}, "serialNumber status");

      if (data) {
        logger.debugOut(__filename, { terminalSerialDetail }, funcIdentifier, 0);

        return resolve(data);
      }

      logger.warn(
        __filename,
        { terminalSerialDetail },
        funcIdentifier,
        "TERMINAL_NOT_FOUND"
      );

      return reject({
        statusCode: 404,
        errorDetails: {
          status: false,
          errorCode: 'TERMINAL_NOT_FOUND',
        }
      });

    } catch (err) {
      logger.warn(__filename, { terminalSerialDetail }, funcIdentifier, err);

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
  searchBySerialNumber,
  deleteTerminal,
  terminalById,
  updateTerminal,
  getAllTerminals,
  register,
  searchById,
  registerByImport,
  downloadParams,
  activateDeactivateTerminal,
  terminalSerialDetail,
};

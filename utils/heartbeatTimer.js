const Terminal = require('../models/Terminal');
const { STATUS, LOGS } = require('../constants/index');
const moment = require('moment');
const { logDetail } = require('../services/StatusLog');
const logger = require('../logger');

const heartBeatTimer = () => {
  logger.debugIn(
    __filename,
    { heartBeatTimer },
    { HeartbeatTimer_Started: moment(new Date).format('DD/MM/YY hh:mm:ss') }
  );
  setInterval(async () => {

    logger.debugIn(
      __filename,
      { heartBeatTimer },
      { HeartbeatTimer_Execution_Start: moment(new Date).format('DD/MM/YY hh:mm:ss') }
    );

    let query = {
      lastCallDate: {
        $lte: moment(new Date()).subtract(process.env.HEART_BEAT_CALL_TIME_OUT, 'minutes')
      }
    };
    query.status = STATUS.ACTIVATE;
    const terminalId = await Terminal.find(query).select('_id');
    if (terminalId && terminalId.length > 0) {
      const startDateTime = new Date();
      const terminalStatusChange = await Terminal.updateMany({ _id: { $in: terminalId } }, { status: STATUS.OFFLINE});
      if (terminalStatusChange.nModified > 0 && terminalStatusChange.n > 0) {
        logDetail(LOGS.SYSTEM, LOGS.HEART_BEAT_CALL_DONE.ACTION, terminalId, LOGS.HEART_BEAT_CALL_DONE.COMMENT + moment(startDateTime).format('DD/MM/YY hh:mm:ss'));
      }

    }
  }, process.env.HEART_BEAT_TIME_INTERVAL * 1000 * 60);
};


module.exports = {
  heartBeatTimer
};

const winston = require('winston');

require('winston-daily-rotate-file');
const fs = require('fs');
const uuid = require('uuid/v4');

require('dotenv').config();

// check if directory exists
if (!fs.existsSync(process.env.LOG_DIR)) {
  fs.mkdirSync(process.env.LOG_DIR); // create new directory
}

const transport = {
  console: new winston.transports.Console(),
  file: new (winston.transports.DailyRotateFile)({
    filename: process.env.LOG_FILE_PREFIX + '-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.MAX_SIZE,
    dirname: process.env.LOG_DIR
  })
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.json()
  ),
  transports: [
    transport.console
  ]
});

if (process.env.LOG_STREAM.toLowerCase() === 'cf') {
  logger.add(transport.file);
}
else if (process.env.LOG_STREAM.toLowerCase() === 'f') {
  logger.add(transport.file);
  logger.remove(transport.console);
}

const infoIn = (req => {
  logger.log({
    level: 'info', method: req.method, path: req.path, query: req.query, body: req.body, reqUuid: req.uuid
  });
});

const infoOut = (res => {
  const resTimeinSec = (res.responseTime.getTime() - res.req.requestTime.getTime()) / 1000;

  logger.log({
    level: 'info', method: res.req.method, path: res.req.path, reqUuid: res.req.uuid, responseTime: resTimeinSec
  });
});

const error = (err => {
  logger.log({ level: 'error', error: err instanceof Error ? err.stack : err });
});

const warn = ((path, f, funcIdentifier, err) => {
  logger.log({ level: 'warn', refPath: '[' + path + ']' + ' ' + Object.keys(f)[0], warning: err instanceof Error ? err.stack : err, funcIdentifier: funcIdentifier });
});

const debugIn = ((path, f, params) => {
  const funcIdentifier = uuid();

  logger.log({ level: 'debug', refPath: '[' + path + ']' + ' ' + Object.keys(f)[0], input: { params }, funcIdentifier: funcIdentifier });

  return funcIdentifier;
});

const debugOut = ((path, f, funcIdentifier, params) => {
  logger.log({ level: 'debug', refPath: '[' + path + ']' + ' ' + Object.keys(f)[0], output: params, funcIdentifier: funcIdentifier });
});

module.exports = {
  infoIn: infoIn,
  infoOut: infoOut,
  debugIn: debugIn,
  debugOut: debugOut,
  error: error,
  warn: warn
};
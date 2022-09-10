const express = require('express');
const router = express.Router();
const Application = require('../services/Application');
const FileStore = require('../services/fileStore');
const Terminal = require('../services/terminal');
const CallSetting = require('../services/callSetting');
const Logs = require('../services/logs');
const Activity = require('../services/StatusLog');
// Download latest Application.
router.post('/download-application', (req, res) => {
  const { serialNumber, fileName, comment, terminals } = req.body;
  Application.downloadApplication(serialNumber, fileName, comment, terminals)
    .then(file => {
      res.download(file);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Download Blacklist from filestore.
router.get('/download-blacklist', (req, res) => {
  const serialNumber = req.query.serialNumber;

  FileStore.downloadBlacklist(serialNumber)
    .then(file => {
      res.download(file);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});


// Download parameter file by using terminal serialNumber, systemIdentifier in request.
router.post('/download-params-file', (req, res, next) => {
  const { serialNumber, systemIdentifier } = req.body;
  const data = req.body;

  Terminal.downloadParams(serialNumber, systemIdentifier, data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
// All scheduled call list
router.post('/heartbeat', (req, res) => {
  const { serialNumber } = req.body;
  const data = req.body;
  CallSetting.checkAllScheduledFilesForDownloads(serialNumber, data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//Upload logs file in Logs by giving serialNumber,file in request.
router.post('/logs', (req, res) => {
  const serialNumber = req.body.serialNumber;
  let file;
  if (req.files) {
    file = req.files.file;
  }

  Logs.uploadLogsFile(file, serialNumber)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Download response store in terminal after download.
router.post('/downloadStatusUpdate', (req, res) => {
  const { serialNumber, downloadRecordDate, fileName, version, fileType } = req.body;

  Activity.downloadResponse(serialNumber, downloadRecordDate, fileName, version, fileType)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
module.exports = router;
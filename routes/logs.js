const express = require('express');
const router = express.Router();
const Logs = require('../services/logs');

//Get all logs data.
router.get('/logs', (req, res) => {

  Logs.getAllLogs(req.query.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Download latest Application.
router.post('/download-logs', (req, res) => {
  const { id } = req.body;
  Logs.downloadLogsFile(id)
    .then(file => {
      res.download(file);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// delete file  by giving id in request.
router.delete('/logs', (req, res) => {
  Logs.deleteLogsFile(req.body.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});


module.exports = router;
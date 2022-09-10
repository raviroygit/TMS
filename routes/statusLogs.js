const express = require('express');
const router = express.Router();
const logs = require('../services/StatusLog');

// Activate terminal  by giving serial number in request.
router.post('/statusLogs', (req, res) => {
  const id = req.body.id;
  logs.getLogsByTerminalId(id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

router.post('/UserLogs', (req, res) => {
  const user = req.userInfo;
  logs.getLogsByUser(user)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});


module.exports = router;


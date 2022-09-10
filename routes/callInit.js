const express = require('express');
const router = express.Router();
const activateTerminal = require('../services/callInit');

// Activate terminal  by giving serial number in request.
router.post('/call-init', (req, res) => {
  const {serialNumber,comment} = req.body;
  const data = req.body;
  activateTerminal.callInit(serialNumber, data,comment)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});


module.exports = router;


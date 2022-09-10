const express = require('express');
const router = express.Router();
const changeConnection = require('../services/changeConnection');

//Change Terminal connection by giving serial number,status in request.
router.post('/connection', (req, res) => {
  const serialNumber = req.body.serialNumber;
  const statusChange = req.body.status;

  changeConnection.setConnection(
    serialNumber, statusChange
  )
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;
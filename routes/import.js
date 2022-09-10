const express = require('express');
const router = express.Router();
const importService = require('../services/importRegistrations');

// Terminal registration by importing file.
router.post('/', (req, res) => {
  const sampleFile = req.files;

  importService.importTerminals(sampleFile)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;

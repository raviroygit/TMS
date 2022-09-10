const express = require('express');
const router = express.Router();
const searchedVersion = require('../services/checkVersion');

// Filter data by given criteria.
router.get('/allVersions', (req, res) => {
  searchedVersion.checkVersion()
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;
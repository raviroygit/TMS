const express = require('express');
const router = express.Router();
const searchFilter = require('../services/report');

// Report data by given criteria.
router.post('/', (req, res) => {
  const data = req.body;
  searchFilter.report(data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Filter data by given criteria.
router.get('/filter', (req, res) => {
  searchFilter.reportFilter()
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;

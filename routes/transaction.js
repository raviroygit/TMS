const express = require("express");
const router = express.Router();
const register = require('../services/transaction');

router.post("/", async (req, res) => {
  const data = req.body;
  register.insertTransaction(data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

router.get('/', (req, res) => {
  register.getAllTransactions()
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Password = require('../services/passwordGenerate');

//Generate password by giving rangeStart, rangeEnd, date, type in request.
router.post('/generate', async (req, res) => {

  const { rangeStart, rangeEnd, date, type } = req.body;

  let file;
  if (req.files) {
    file = req.files.file;
  }

  Password.passwordGenerate(file, rangeStart, rangeEnd, date, type)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
module.exports = router;
const express = require("express");
const router = express.Router();
const dashboard = require("../services/dashboard");

router.post("/detail", (req, res) => {
  const data = req.body;
  dashboard
    .dashboard(data)
    .then((status) => {
      res.json(status);
    })
    .catch((err) => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;

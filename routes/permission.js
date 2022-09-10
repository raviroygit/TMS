const express = require('express');
const router = express.Router();
const permission = require('../services/permission');

// create and record permission data and get back success msg.

router.post('/permission', (req, res) => {
  const { role, features, route } = req.body;
  permission.permission(role, features, route)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// update and record permission data and get back success msg.

router.put('/permission', (req, res) => {
  const { role } = req.body;
  const data = req.body;
  permission.updatePermission(role, data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//get permission by role and get back response to route.

router.post('/getPermissionByRole', (req, res) => {
  const role = req.body.role;
  permission.getPermissionByRole(role)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;


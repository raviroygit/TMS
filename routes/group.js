/* eslint-disable prefer-arrow-callback */
const express = require('express');
const router = express.Router();
const group = require('../services/group');

//Registered group by giving data in request.
router.post('/register', (req, res) => {
  const user = req.userInfo;
  const data = req.body;
  group.merchantRegister(data,user)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//Get parent group list.
router.get('/merchant-list', (req, res) => {

  const { groupName, isParent } = req.query;

  group.getMerchantList(groupName, isParent)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Update Group details by group name.
router.put('/update/:id', (req, res) => {
  const user = req.userInfo;
  const data = req.body;
  const terminal = req.body.terminal;
  const subGroup = req.body.subGroup;

  group.update(req.params.id, terminal, subGroup, data, user)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Get group details by giving group name in request.
router.get('/merchantByName/:merchantName', (req, res) => {
  const merchantName = req.params.merchantName;

  group.getMerchantByName(merchantName)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Get group details by giving id in request

router.get('/merchantById/:id', (req, res) => {

  group.getMerchantById(req.params.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//Delete merchant by giving id in request. 
router.delete('/deleteById/:id', (req, res) => {
  const user = req.userInfo;
  group.deleteMerchantById(req.params.id,user)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Assign terminal by giving group name ,serial number in request.
router.post('/assign-terminal', (req, res) => {
  const merchantName = req.body.merchantName;
  const serialNumber = req.body.serialNumber;

  group.assignTerminal(serialNumber, merchantName)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//Get group list.
router.get('/list', (req, res) => {

  group.groupList()
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;
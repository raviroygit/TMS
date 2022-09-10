const express = require("express");
const router = express.Router();
const register = require('../services/terminal');
const path = require('path');


// Delete terminal and back response status.
router.post('/delete', (req, res) => {
  const user = req.userInfo;
  const { ids, terminals, comment } = req.body;
  register.deleteTerminal(user, ids, terminals, comment)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Search terminal by giving serial number in request.
router.get("/search", (req, res) => {
  const serialNumber = req.query.serialNumber;

  register.searchBySerialNumber(
    serialNumber
  )
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Get all terminal serialNumber.
router.get('/serialList', (req, res) => {
  register.terminalSerialDetail()
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Search terminal by giving id in request.
router.get('/searchById', (req, res) => {

  register.searchById(req.query.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
// Activate deactivate terminal  by giving array of ids in request.
router.post('/statusChange', (req, res) => {
  const user = req.userInfo;
  const { Ids, status, terminals, comment } = req.body;
  register.activateDeactivateTerminal(user, Ids, status, terminals, comment)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Register terminal by giving required data in request.
router.post("/register", async (req, res) => {
  const data = req.body;
  register.register(data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Get all terminal list.
router.get('/terminal-list', (req, res) => {
  const { groupName } = req.query;
  register.getAllTerminals(groupName)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Update terminal by giving id in request.
router.put('/updateTerminal', (req, res) => {
  const data = req.body;
  const { ids, groups, comment, action } = req.body;
  register.updateTerminal(ids, groups, data, comment, action)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Get terminal by giving id in request.
router.get('/:id', (req, res) => {

  register.terminalById(req.params.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Download parameter file by using terminal serialNumber, systemIdentifier in request.
router.post('/download/params-file', (req, res, next) => {
  const { serialNumber, systemIdentifier, merchantName, city, address, comment } = req.body;

  register.downloadParams(serialNumber, systemIdentifier, merchantName, city, address, comment)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});




module.exports = router;

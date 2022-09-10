const express = require('express');
const router = express.Router();
const fs = require('fs');
const application = require('../services/Application');

//  Get file  by giving id in request.
router.get('/getFileById/:id', (req, res) => {
  fileStore.getApplicationById(req.params.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//Create or upload file in filestore by giving type,file in request.
router.post('/upload', async (req, res) => {
  const { type, appType, price, model, businessCategories, description, title, releaseNote } = req.body;
  const userName = req.userInfo.name;
  let file, logo, screenShots;

  if (req.files) {
    file = req.files.file;
    logo = req.files.logo;
    screenShots = req.files.screenShots;
  }

  application.createApplication(file, logo, screenShots, type, appType, price, model, businessCategories, description, userName, title, releaseNote)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

//Get all filestore data.
router.get('/getAllApplication', (req, res) => {

  application.getAllApplication()
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
// delete file  by giving id in request.
router.delete('/deleteById', (req, res) => {
  application.deleteFileById(req.query.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// update file details from file store  by giving id in request.
router.put('/update/:id', async (req, res) => {
  const data = req.body;
  let file;
  if (req.files) {
    file = req.files.file;
  }

  application.update(req.params.id, file, data)

    .then(status => {
      res.json(status);

    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});


// Get Application by giving id in request.
router.get('/getApplication/:id', (req, res) => {
  application.getApplicationById(req.params.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});


// Get Application by giving id in request.
router.get('/byTerminalId', (req, res) => {
  application.getApplicationByTerminalId(req.query.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// update file details from file store  by giving id in request.
router.put('/assignAppsToTerminal', async (req, res) => {
  const data = req.body;
  application.assignAppsToTerminal(data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Get file by giving id in request.
const fileStore = require('../services/fileStore');

router.get('/getFileById/:id', (req, res) => {

  fileStore.getFilStoreById(req.params.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
//Create file data in filestore by giving type, status, suplier, description in request.
router.post('/upload', async (req, res) => {
  const { type, status, suplier, description } = req.body;
  let file;
  if (req.files) {
    file = req.files.file;
  }

  fileStore.createFileStore(file, type, status, suplier, description)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
// Get all file store data list.
router.get('/getAllFiles', (req, res) => {

  fileStore.getFileStoreList(req.query)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});
// Delete file by giving id in request.
router.delete('/deleteById', (req, res) => {
  fileStore.deleteFileById(req.query.id)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Update file details from file store  by giving id,data in request.
router.put('/update/:id', async (req, res) => {

  const { status } = req.body;
  let file;
  if (req.files) {
    file = req.files.file;
  }

  fileStore.update(req.params.id, status, file)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Download parameter file by using terminal serialNumber, systemIdentifier in request.
router.get('/download', (req, res) => {
  const { id } = req.query;

  fileStore.downloadBlacklistParam(id)
    .then(file => {
      res.download(file);
    })
    .catch(err => {
      res.status(err);
    });
});
module.exports = router;
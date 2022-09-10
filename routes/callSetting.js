const express = require('express');
const router = express.Router();
const CallSetting = require('../services/callSetting');

//Call schedule by giving starting time, ending time, type, ids, date in request.
router.post('/schedule', (req, res) => {

  const data = req.body;
  CallSetting.callSchedule(data)
    .then(status => {
      res.json(status);

    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// call reschedule   by giving starting time, ending time, type, ids, date in request.
router.put('/reschedule', (req, res) => {
  const data = req.body;

  CallSetting.reschedule(req.body.id, data)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// deleted scheduled call by giving id in request.
router.delete('/deleteById/:id', (req, res) => {

  CallSetting.deleteCallSchedule(req.params.id)
    .then(status => {
      res.json(status);

    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// All scheduled call list
router.get('/scheduled-list', (req, res) => {

  CallSetting.CallScheduledList(req.query)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

// Get scheduled call by giving id in request.
router.get('/:id', (req, res) => {

  const id = req.params.id;
  CallSetting.getCallById(id)
    .then(status => {
      res.json(status);

    })
    .catch(err => {
      res.status(err.statusCode).json(err.errorDetails);
    });
});

module.exports = router;
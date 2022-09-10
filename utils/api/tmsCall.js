const terminal = require('../../routes/register');
const callInitTerminal = require('../../routes/callInit');
const tmsCall = require('../../routes/tmsCallRoute');
const transaction = require('../../routes/transaction');


module.exports = {
  routes: [
    {
      route: '/',
      controller: tmsCall
    },
    {
      route: '/',
      controller: callInitTerminal
    },
    {
      route: '/transaction',
      controller: transaction
    },
  ]
};
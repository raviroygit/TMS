const terminal = require('../../routes/register');
const importRouter = require('../../routes/import');
const ChangeConnectionStatusRouter = require('../../routes/changeConnection');
const fileStore = require('../../routes/fileStore');
const merchantRouter = require('../../routes/group');
const applicationRouter = require('../../routes/application');
const callScheduleRouter = require('../../routes/callSetting');
const passwordGenerate = require('../../routes/passwordGenerate');
const CheckedVersion = require('../../routes/checkVersion');
const reportApi = require('../../routes/report');
const activity = require('../../routes/statusLogs');
const dashboard = require('../../routes/dashboardRoute');
const permission = require('../../routes/permission');
const transaction = require('../../routes/transaction');
const logs = require('../../routes/logs');

module.exports = {
  routes: [
    {
      route: '/portal/terminal',
      controller: terminal
    },
    {
      route: '/portal/terminalImport',
      controller: importRouter
    },
    {
      route: '/portal/terminal',
      controller: ChangeConnectionStatusRouter
    },
    {
      route: '/portal/merchant',
      controller: merchantRouter
    },
    {
      route: '/portal/filestore',
      controller: fileStore
    },
    {
      route: '/portal/application',
      controller: applicationRouter
    },
    {
      route: '/portal/call',
      controller: callScheduleRouter
    },
    {
      route: '/portal/password',
      controller: passwordGenerate
    },
    {
      route: '/portal/',
      controller: CheckedVersion
    },
    {
      route: '/portal/report',
      controller: reportApi
    },
    {
      route: '/portal/',
      controller: activity
    },
    {
      route: '/portal/dashboard',
      controller: dashboard
    },
    {
      route: '/portal',
      controller: permission
    },
    {
      route: '/portal/transaction',
      controller: transaction
    },
    {
      route: '/portal',
      controller: logs
    },
  ]
};
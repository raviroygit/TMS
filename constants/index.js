
module.exports = {
  TMS: 'TMS',
  STATUS: {
    ACTIVATE: 'Active',
    PASSIVE: 'Passive',
    OFFLINE: 'Offline',
    DECLARED: 'Declared',
  },
  APPLICATION: {
    TYPE: 'Application',
    DOWNLOADED: 'Download requested',
  },
  FILESTORE: {
    BLACKLIST: 'Blacklist'
  },
  PASSWORDGENERATE: {
    SUPER_PASSWORD: 'superPassword',
    MAINTAINER_PASSWORD: 'maintainerPassword'
  },
  TERMINAL: {
    BLACKLIST: 'Blacklist',
    ACTIVE: 'Active',
    PARAMETER: 'Parameter',
    PARAMETER_PROD: 'Parameter_Prod',
    PARAMETER_TEST: 'Parameter_Test',
    PARAMETER_BILL: 'Parameter_Bill'
  },
  LOGS: {
    USER: 'User',
    SYSTEM: 'System',
    DOWNLOADED: 'Downloaded',
    ACTION: "Download Logs File",
    TERMINAL_UPDATE: {
      ACTION: "TERMINAL_UPDATE",
      AAS_SETTING: 'AAS_CHANGE'
    },
    TERMINAL_STATUS_CHANGE: {
      ACTIVE: 'ACTIVE_STATUS',
      PASSIVE: 'PASSIVE_STATUS',
    },
    TERMINAL_DELETE: {
      ACTION: 'TERMINAL_DELETE'
    },
    GROUP_CREATED: {
      ACTION_GROUP: "GROUP_ADD",
      ACTION_SUB_GROUP: "SUBGROUP_ADD"
    },
    GROUP_UPDATE: {
      BANK: "bank",
      ACTION_GROUP: "GROUP_UPDATE",
      ACTION_SUB_GROUP: "SUBGROUP_UPDATE"
    },
    GROUP_DELETE: {
      ACTION: 'GROUP_DELETE'
    },
    PARAMS_FILE_DOWNLOAD: {
      ACTION: 'DOWNLOAD_PARAM_FILES'
    },
    CALL_INIT: {
      ACTION: 'CALL_INITIATED'
    },
    DOWNLOAD_BLACKLIST: {
      ACTION: 'BLACKLIST_FILE_DOWNLOADED'
    },
    APPLICATION_DOWNLOAD: {
      ACTION: 'APPLICATION_DOWNLOADED'
    },
    HEART_BEAT_CALL: {
      ACTION: 'HEARTBEAT_CALL_INITIATED'
    },
    DOWNLOAD_HISTORY: {
      COMMENT: 'Downloaded',
      ACTION: 'DOWNLOADED_RESPONSE'
    },
    HEART_BEAT_CALL_DONE: {
      ACTION: 'HEARTBEAT_CALL_CHANGE_TERMINAL_STATUS',
      COMMENT: 'Heartbeat Timer done at '
    },
    LOGS_UPLOAD: {
      ACTION: 'LOGS_UPLOADED',
      COMMENT: ''
    }
  },
  FILE_TYPE: {
    APPLICATION: 'Application',
    KERNEL: 'Kernel',
    OS: 'OS',
    BLACKLIST: 'Blacklist',
    DOWNLOAD_STATUS: 'Done'
  },
  TRANSACTION: {
    SALE: 'sale',
    CASH: 'cash',
    REFUND: 'refund',
    BILL_PAYMENT: 'billPayment',
    CANCELLATION: 'cancellation',
    PRE_AUTHORIZATION: 'preAuthorization',
    PRE_AUTHORIZATION_VALIDATION: 'preAuthorizationValidation',
    ACCEPT: 'accepted',
    REFUSED: 'refused',
    FAILED: 'failed',
  },
  ERROR: {
    MESSAGE: "Unsupported media type"
  }
};
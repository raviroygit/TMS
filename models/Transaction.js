const mongoose = require('mongoose');
const { TRANSACTION } = require('../constants/index')

const TransactionSchema = new mongoose.Schema(
  {
    serialNumber: {
      required: true,
      type: String,
    },
    systemIdentifier: {
      type: String,
    },
    paymentType: {
      type: String,
      enum: [TRANSACTION.SALE, TRANSACTION.CASH, TRANSACTION.REFUND, TRANSACTION.BILL_PAYMENT, TRANSACTION.CANCELLATION, TRANSACTION.PRE_AUTHORIZATION, TRANSACTION.PRE_AUTHORIZATION_VALIDATION],
    },
    acceptingIssueNumber: {
      type: String
    },
    transactionNumber: {
      type: String
    },
    transactionAmount:{
      type: String
    },
    cardHolderNumber: {
      type: String
    },
    authorizationNumber: {
      type: String
    },
    selectedAID: {
      type: String
    },
    transactionTVR: {
      type: String
    },
    transactionStatus: {
      type: String,
      enum: [TRANSACTION.ACCEPT, TRANSACTION.REFUSED, TRANSACTION.FAILED],
    },
    refusingReason: {
      type: String
    },
    SPDHRefusalCode: {
      type: String
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model(
  'Transaction',
  TransactionSchema
);

module.exports = Transaction;
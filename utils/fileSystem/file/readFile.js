const csv = require('csvtojson');

module.exports = path => {
  return new Promise(async (resolve, reject) => {
    
    csv()
      .fromFile(path)
      .then(csvData => {
        return resolve(csvData);
      }).catch(err => {
        return reject({
          errorCode: 'UNKNOWN_ERROR',
          errorDetails: err.toString()
        });
      });
  });
};
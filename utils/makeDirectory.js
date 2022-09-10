const fs = require('fs');

const makeDirectory = (path) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, exist) => {
      if (exist) {
        return resolve(exist)
      }
      fs.mkdir(path, { recursive: true }, (error) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(true);
        }
      });
    })
  });
};

module.exports = {
  makeDirectory
};
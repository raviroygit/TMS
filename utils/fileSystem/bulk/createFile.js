const fs = require('fs');

module.exports = (dataArray, dest, callback) => {
  let error = '';

  let count = dataArray.length;

  if (count === 0) {
    return callback();
  }

  dataArray.forEach(x => {
    fs.writeFile(dest + '/' + x.name, x.script, err => {
      if (err) {
        error = err.toString();
      }

      count--;

      if (count === 0) {
        if (error !== '') {
          return callback(error);
        }

        return callback();
      }
    });
  });
};

// const socketIo = require('socket.io');

// let io;

// function initializeSocket(server2) {
//   io = socketIo.listen(server2);
// }

// const operations = {
//   receive: () => {
//     // eslint-disable-next-line no-unused-vars
//     io.on('connection', client => {
//       // Use the following snippet to receive messages from client
//       // client.on('msg', () => {
//       //   console.log("Received msg from client");
//       // });
//     });
//   }
// };

// const emit = (id, data) => {
//   io.emit(id, data);
// };

// exports.initializeSocket = initializeSocket;
// exports.operations = operations;
// exports.emit = emit;
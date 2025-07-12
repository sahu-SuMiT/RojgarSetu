let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://127.0.0.1:3000',
          'https://campusadmin.onrender.com',
          'http://43.205.232.182:5000'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
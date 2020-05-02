const { Route, Order, User } = require('./models');

class WebSockets {
  constructor(io) {
    this._io = io;
  }

  connect() {
    this._io.on('connection', (socket) => {

      socket.on('join', projectId => {
        socket.join(`project: ${projectId.toString()}`, () => {
          socket.emit('join', 'Done!');
        });
      });

      socket.on('drive', async (driveData) => {
        // const updatedroute = await Route.update(
        //   { projectId: driveData.projectId, driveData.route.id },
        //   {
        //     $push: {
        //       timeline: driveData.timeline
        //     }
        //   },
        //   { new: true }
        // );
        socket.broadcast.to(`project: ${driveData.projectId.toString()}`).emit('drive', driveData);
        console.log(driveData);
      });
    });
  }
}

module.exports = (io) => {
  return new WebSockets(io);
}

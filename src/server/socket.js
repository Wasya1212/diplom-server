const { Route, Order, User } = require('./models');

class WebSockets {
  constructor(io) {
    this._io = io;
  }

  connect() {
    this._io.on('connection', (socket) => {

      socket.on('disconnect', async () => {
        let room = Object.keys(socket.rooms)[1];

        try {
          socket.leave(room);
        } catch (e) {
          console.error(err);
        }
      });

      socket.on('join', projectId => {
        socket.join(`project: ${projectId.toString()}`, () => {
          socket.emit('join', 'Done!');
        });
      });

      socket.on('drive', async (driveData) => {
        await Route.update(
          { projectId: driveData.project, _id: driveData.route._parameters.id },
          {
            status: 'processing',
            $push: {
              timeline: driveData.timeline
            }
          },
          { new: true }
        );
        socket.broadcast.to(`project: ${driveData.projectId.toString()}`).emit('drive', driveData);
      });
    });
  }
}

module.exports = (io) => {
  return new WebSockets(io);
}

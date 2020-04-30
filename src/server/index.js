const Http = require('http');
const Https = require('https');

const Server = require('./server');

const Mongoose = require('./middleware/mongoose');

const HOST = 'localhost';
const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.PORT + 1 || 3001;

const HttpServer = Http.createServer(Server.callback());
const HttpsServer = Https.createServer(Server.callback());

HttpServer.listen(HTTP_PORT, listeningReporter);
// HttpsServer.listen(HTTPS_PORT, HOST, listeningReporter);

const io = require('socket.io')(HttpServer);
const WebSockets = require('./socket')(io);

Mongoose.connect();
WebSockets.connect()

process.on('exit', (code) => {
   Mongoose.closeConnection();
   console.log(`About to exit with code: ${code}`);
});

process.on('SIGINT', function() {
   console.log("Caught interrupt signal");
   process.exit();
});

function listeningReporter () {
  const { address, port } = this.address();
  const protocol = this.addContext ? 'https' : 'http';
  console.log(`Listening on ${protocol}://${address}:${port}...`);
};

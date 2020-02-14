const Http = require('http');
const Https = require('https');

const Server = require('./server');

const Mongoose = require('./middleware/mongoose');

const HOST = 'localhost';
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.PORT + 1 || 3001;

const HttpServer = Http.createServer(Server.callback());
const HttpsServer = Https.createServer(Server.callback());

HttpServer.listen(HTTP_PORT, listeningReporter);
// HttpsServer.listen(HTTPS_PORT, HOST, listeningReporter);

Mongoose.connect();

function listeningReporter () {
  const { address, port } = this.address();
  const protocol = this.addContext ? 'https' : 'http';
  console.log(`Listening on ${protocol}://${address}:${port}...`);
};

const mongoose = require('mongoose');
const mongodb = require('mongodb')
// const MongoStore = require("koa-session2-mongostore/index.mongoose");
// const MongoStore = require('../libs/session-store');
const MongoStore = require('koa-session2-mongostore');
const AutoIncrement = require('mongoose-sequence')(mongoose);

require('mongoose-type-email');
require('mongoose-type-phone');
require('mongoose-type-url');

let mongoClient = null;

mongoose.set('useFindAndModify', false);

module.exports.mongoose = mongoose;

module.exports.AutoIncrement = AutoIncrement;

module.exports.createStore = () => {
  return new MongoStore({
      url: "mongodb+srv://wasya1212:wasya1212@cluster0-v4ayb.mongodb.net/test?retryWrites=true&w=majority",
      dbName: "test"
  });
};

module.exports.destroySession = async (sid) => {
  return new Promise((resolve, reject) => {
    mongoose.connection.db.collection('mongod__session', (err, collection) => {
      collection.deleteOne({ sid: sid }, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  });

  // console.log("connection:", .find({}));
  // return await mongoose.connection.db.db('Cluster0').collection('mongod_session').find({});
};

module.exports.connect = () => {
  mongoose.connect(
    'mongodb+srv://wasya1212:wasya1212@cluster0-v4ayb.mongodb.net/test?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    },
    (err, client) => { mongoClient = client }
  );

  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  mongoose.connection.once('open', function() {
    console.log("Mongo connected!");
  });
};

module.exports.closeConnection = async () => {
  try {
    mongoClient.close();
  } catch (err) {
    console.error(err);
  }
};

module.exports.Schema = mongoose.Schema;

module.exports.Model = class Model {
  _name = '';
  _schema = null;

  constructor(name, schema) {
    this._name = name;
    this._schema = schema;
  }

  get name() {
    return this._name;
  }

  get schema() {
    return this._schema;
  }

  create() {
    return mongoose.model(this._name, this._schema);
  }
};

module.exports.Types = Object.assign(
  {
    String,
    Buffer,
    Boolean,
    Date,
    Number,
    Map
  },
  mongoose.Schema.Types,
  mongoose.SchemaTypes
);

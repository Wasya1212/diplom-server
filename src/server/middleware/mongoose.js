const mongoose = require('mongoose');

require('mongoose-type-email');
require('mongoose-type-phone');
require('mongoose-type-url');

let mongoClient = null;

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

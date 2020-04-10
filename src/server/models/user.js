const bcrypt = require('bcrypt');

const { Schema, Model, Types } = require('../middleware/mongoose');

const userSchema = new Schema({
  name: {
    fName: { required: true, type: Types.String, max: 70, lowercase: true, trim: true },
    mName: { required: true, type: Types.String, max: 70, lowercase: true, trim: true },
    lName: { required: true, type: Types.String, max: 50, lowercase: true, trim: true }
  },
  email: { required: true, type: Types.Email, unique: true },
  passwordHash: { required: false, type: Types.String },
  phone: { required: true, type: Types.Phone, unique: true },
  photo: { required: false, type: Types.Url },
  accessLevel: { required: true, type: Types.Number, min: 1, default: 1 },
  personalInfo: {
    birthDate: { required: false, type: Types.Date },
    childrens: { required: true, type: Types.Boolean, default: false },
    childrensCount: { required: false, default: 0, type: Types.Number, default: 0 },
    married: { required: true, type: Types.Boolean, default: false },
    address: {
      country: { required: false, type: Types.String, max: 70, lowercase: true, trim: true },
      city: { required: false, type: Types.String, max: 100, lowercase: true, trim: true },
      street: { required: false, type: Types.String, max: 150, lowercase: true, trim: true },
      apartments: { required: false, type: Types.String, max: 50, lowercase: true, trim: true }
    },
    criminalRecords: [{ required: false, type: Types.String }],
    additionalInfo: { required: false, type: Types.Mixed }
  },
  workInfo: {
    post: { required: false, type: Types.String, max: 255, lowercase: true, trim: true },
    hired: { required: false, type: Types.Date },
    fired: { required: false, type: Types.Date },
    currentSalary: { required: false, type: Types.Number },
    currentStatus: { required: false, type: Types.String }, // vacation, work...
    workDays: [{ required: false, type: Types.String, uppercase: true, trim: true }],
    aviabilityOfVacation: { required: true, type: Types.Boolean, default: false },
    statistics: {
      routes: [{ required: false, type: Types.ObjectId }],
      unpredictableSituations: [{ required: false, type: Types.ObjectId }]
    },
    additionalInfo: { required: false, type: Types.Mixed }
  }
}, { timestamps: true });

// need to add validations

userSchema.virtual('password')
  .set(function (password) {
    console.log("voirtual password SET!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    this.passwordHash = bcrypt.hashSync(password, 10);
  })
  .get(function () {
    return this.password;
  });

userSchema.methods.checkPassword = function (password) {
  if (!password) return false;
  if (!this.passwordHash) return false;

  console.log("CURRENT USER PASSWORD", password);
  console.log("CURRENT HASHED PASSWORD", this.passwordHash);

  return bcrypt.compareSync(password, this.passwordHash);
};

const userModel = new Model('User', userSchema);

module.exports = userModel.create();

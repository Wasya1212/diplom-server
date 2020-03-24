const { Schema, Types } = require('../middleware/mongoose');

const userSchema = new Schema({
  name: {
    fName: { required: true, type: Types.String, max: 70, lowercase: true, trim: true },
    mName: { required: true, type: Types.String, max: 70, lowercase: true, trim: true },
    lName: { required: true, type: Types.String, max: 50, lowercase: true, trim: true }
  },
  email: { required: true, type: Types.Email, uniqe: true },
  password: { required: true, type: Types.String },
  phone: { required: true, type: Types.Phone, uniqe: true },
  photo: { required: true, type: Types.Url, uniqe: true },
  presonalInfo: {
    birthDate: { required: true, type: Types.Date },
    childrens: { required: true, type: Types.Boolean },
    childrensCount: { required: false, default: 0, type: Types.Number },
    married: { required: true, type: Types.Boolean },
    address: {
      coutry: { required: true, type: Types.String, max: 70, lowercase: true, trim: true },
      city: { required: true, type: Types.String, max: 100, lowercase: true, trim: true },
      street: { required: true, type: Types.String, max: 150, lowercase: true, trim: true },
      apartments: { required: true, type: Types.String, max: 50, lowercase: true, trim: true }
    },
    criminalRecords: [{ required: false, type: Types.String }],
    additionalInfo: { required: false, type: Types.Mixed }
  },
  workInfo: {
    post: { required: true, type: Types.String, max: 255, lowercase: true, trim: true },
    hired: { required: true, type: Types.Date },
    fired: { required: false, type: Types.Date },
    currentSalary: { required: false, type: Types.Number },
    currentStatus: { required: false, type: Types.String }, // vacation, work...
    workDays: [{ required: false, type: Types.String, uppercase: true, trim: true }],
    aviabilityOfVacation: { required: true, type: Types.Boolean, default: false },
    statistics: {
      routes: [ Types.ObjectId ],
      unpredictableSituations: [ Types.ObjectId ]
    },
    additionalInfo: { required: false, type: Types.Mixed }
  }
}, { timestamps: true });

// need to add validations

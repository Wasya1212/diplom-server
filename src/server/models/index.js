const UserModel = require('./user');
const RouteModel = require('./route');
const CarModel = require('./car');
const UnpredictableSituationModel = require('./unpredictableSituation');

module.exports = {
  User: UserModel,
  Route: RouteModel,
  Car: CarModel,
  UnpredictableSituation: UnpredictableSituationModel
};

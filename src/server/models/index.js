const UserModel = require('./user');
const RouteModel = require('./route');
const CarModel = require('./car');
const UnpredictableSituationModel = require('./unpredictableSituation');
const FeatureModel = require('./feature');
const ProjectModel = require('./project');

module.exports = {
  User: UserModel,
  Route: RouteModel,
  Car: CarModel,
  UnpredictableSituation: UnpredictableSituationModel,
  Feature: FeatureModel,
  Project: ProjectModel
};

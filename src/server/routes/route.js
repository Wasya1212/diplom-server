const Router = require('koa-router');
const fs = require('fs');

const Cloudinary = require('../middleware/cloudinary');

const { Route, Order, User } = require('../models');

const router = new Router();

router.post('/route/close', async (ctx) => {
  const closedRoute = await Route.update(
    { project: ctx.request.body.projectId, _id: ctx.request.body.routeId },
    { status: 'closed' },
    { new: true }
  );

  ctx.body = closedRoute;
});

router.get('/routes', async (ctx) => {
  const query = {...ctx.request.query};
  delete query.projectId;

  const routes = await Route.find({ project: ctx.request.query.projectId, ...query });

  const responseRoutes = [];

  for (let i = 0; i < routes.length; i++) {
    responseRoutes.push({
      _id: routes[i]._id,
      project: routes[i].project,
      orders: await Order.find({ _id: { $in: routes[i].orders } }),
      users: await User.find({ _id: { $in: routes[i].users } }),
      date: routes[i].date,
      waypoints: routes[i].waypoints,
      plannedRoute: routes[i].plannedRoute,
      currentRoute: routes[i].currentRoute,
      car: routes[i].car,
      timeline: routes[i].timeline,
      status: routes[i].status
    });
  }

  ctx.body = responseRoutes;
});

router.post('/route/create', async (ctx) => {
  const route = await Route.create({
    project: ctx.request.body.projectId,
    users: ctx.request.body.users.map(w => w._parameters.id),
    date: ctx.request.body.date,
    orders: ctx.request.body.orders.map(o => o._parameters.id),
    plannedRoute: ctx.request.body.plannedRoute,
    waypoints: ctx.request.body.waypoints,
    timeline: ctx.request.body.timeline
  });

  Order.update(
    {
      _id: { $in: route.orders },
      project: ctx.request.body.projectId
    },
    { status: "confirmed" },
    { new: true, multi: true },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  ctx.body = {
    route: Object.assign(
      route._doc,
      {
        orders: ctx.request.body.orders.map(o => o._parameters),
        users: ctx.request.body.users.map(w => w._parameters)
      }
    )
  };
});

module.exports = router;

import React, { Component } from "react";

import { connect } from "react-redux";

import { Route } from "../../utils/route";
import { Order } from "../../utils/order";
import { Product } from "../../utils/product";
import { Worker } from "../../utils/worker";
import { MapComponent as Map, Coordinates } from "../../utils/map";
import { WaypointController } from "../../utils/waypointMapController";
import { Object3DMapController } from "../../utils/object3DMapController";

import {
  calculateDistance,
  parseToCoordsObject,
  calculateAngle
} from "../../utils/mapCalc";

interface DriveState {
  userRoutes: Route[],
  selectedRoute?: Route,
  selectedOrder?: Order,
  _map: any,
  cars: any[],
  drivingMode: boolean,
  mapCenter?: Coordinates,
  mapBearing?: number,
  mapZoom?: number,
  mapPitch?: number
}

class DriveComponent extends Component<any, DriveState> {
  private _timer;
  private _socket = this.props.store.web_socket;

  state = {
    userRoutes: [],
    selectedRoute: undefined,
    selectedOrder: undefined,
    _map: undefined,
    cars: [
      // { position: { lng: 24.021847295117936, lat: 49.85496650618947 } },
      // { position: { lng: 24.027847295117936, lat: 49.85896650618947 } },
      // { position: { lng: 24.015847295117936, lat: 49.86296650618947 } },
      // { position: { lng: 24.031847295117936, lat: 49.86696650618947 } },
      // { position: { lng: 24.011847295117936, lat: 49.87296650618947 } },
      // { position: { lng: 24.001847295117936, lat: 49.87296650618947 } },
      // { position: { lng: 24.041847295117936, lat: 49.87296650618947 } }
    ],
    drivingMode: false,
    mapCenter: undefined,
    mapBearing: undefined,
    mapZoom: undefined,
    mapPitch: undefined
  }

  constructor(props) {
    super(props);

    this._socket.emit('join', this.props.store.current_project._id);
    this._socket.on('join', result => {
      console.log(result);
    });
  }

  componentDidMount() {
    Route
      .getRoutes(this.props.store.current_project._id)
      .then((routes: Route[]) => {
        this.setState({ userRoutes: routes });
      });
  }

  selectRoute(route: Route) {
    this.setState({ selectedRoute: route });
  }

  deselectRoute = () => {
    this.setState({ selectedRoute: undefined });
  }

  handleMapLoad = (map) => {
    this.setState({ _map: map });

    map.on('click', 'layer-' + 'checkpoint', async (e) => {
      const waypointIndex = +e.features[0].properties.title - 1;
      const checkedOrder: Order = new Order((this.state.selectedRoute || new Route({})).orders[waypointIndex]);
      const order: Order = await Order.findById( this.props.store.current_project._id, checkedOrder.id || '' );

      this.selectWaypoint(order);
    });
  }

  selectWaypoint(order: Order) {
    this.setState({ selectedOrder: order })
  }

  deselectWaypoint = () => {
    this.setState({ selectedOrder: undefined });
  }

  startDrive = () => {
    if (!this.state._map) {
      return;
    } else {
      this.setState({ drivingMode: true });
    }

    const route = WaypointController.decodeRoute((this.state.selectedRoute || new Route({})).plannedRoute || "");
    const { driveImitation } = this.getDriveImitation(route);

    WaypointController.drawRoute(this.state._map, route);

    this.deselectWaypoint();
    this.startDriveImitation(driveImitation);
  }

  private startDriveImitation(driveImitation) {
    let startPosition = 0;
    let currentIndex = 0;
    let points = Object3DMapController.breakRouteToPoints(driveImitation[0].from, driveImitation[0].to);;

    this.setState({cars: [{ position: driveImitation[0].from }]});

    this._timer = setInterval(() => {
      if (startPosition >= driveImitation.length) {
        this.endDriveImitation();
        return;
      }

      if (currentIndex + 1 >= points.length) {
        startPosition++;
        points = Object3DMapController.breakRouteToPoints(driveImitation[startPosition].from, driveImitation[startPosition].to);
        currentIndex = 0
      } else {
        currentIndex++;
      }

      this.setState({
        cars: [{
          position: points[currentIndex],
          rotation: driveImitation[startPosition].angle
        }],
        mapCenter: points[currentIndex],
        mapZoom: 20,
        mapBearing: -driveImitation[startPosition].angle,
        mapPitch: 65
    });
  }, 300);
  }

  private endDriveImitation = () => {
    try {
      clearInterval(this._timer);
      WaypointController.clearRoute(this.state._map);
      this.setState({ cars: [], drivingMode: false });
    } catch (err) {
      console.error(err);
    }
  }

  private getDriveImitation(route) {
    let driveImitation: any = [];

    route.forEach((point: number[], index: number) => {
      if (index + 1 == route.length) {
        return;
      }

      let currentPoint = parseToCoordsObject(point);
      let nextPoint = parseToCoordsObject(route[index + 1]);

      let routeDistance = calculateDistance(currentPoint, nextPoint);
      let routeRotationAngle = calculateAngle(currentPoint, nextPoint);
      routeRotationAngle = routeRotationAngle > 30 ? routeRotationAngle - 55 : routeRotationAngle;

      driveImitation.push({
        from: currentPoint,
        to: nextPoint,
        distance: routeDistance,
        angle: routeRotationAngle
      });
    });

    return { route, driveImitation };
  }

  render() {
    if (this.state.selectedRoute) {
      const route = this.state.selectedRoute || new Route({});
      return (
        <div>
          <button onClick={this.deselectRoute}>Back</button>
          {
            this.state.drivingMode
              ?<button onClick={this.endDriveImitation}>End drive</button>
              : <button onClick={this.startDrive}>Start drive</button>
          }
          <Map
            center={this.state.mapCenter || route.waypoints[0]}
            markers={route.waypoints}
            zoom={this.state.mapZoom || 15}
            onLoad={this.handleMapLoad}
            cars={this.state.cars}
            bearing={this.state.mapBearing || 0}
            pitch={this.state.mapPitch || 0}
          />
          {
            this.state.selectedOrder
              ? (
                <aside>
                  <button onClick={this.deselectWaypoint}>Close</button>
                  <p>Order #{(this.state.selectedOrder || new Order({})).number}</p>
                  <p>Registred by: {new Worker((this.state.selectedOrder || new Order({})).operator).name}</p>
                  <ul>
                    {
                      ...(this.state.selectedOrder || new Order({})).workers.map(w => {
                        const worker = new Worker(w);
                        return (
                          <li key={`order-worker-${worker.id}`}>
                            <span>{worker.name}</span>
                            <img src={worker.photo}/>
                          </li>
                        );
                      })
                    }
                  </ul>
                  <p>{(this.state.selectedOrder || new Order({})).address}</p>
                  <p>{(this.state.selectedOrder || new Order({})).description}</p>
                  <p>{(this.state.selectedOrder || new Order({})).deliveryDate}</p>
                  <ul>
                    {
                      ...((this.state.selectedOrder || new Order({})).products || []).map(p => {
                        const product = new Product(p.product);
                        return (
                          <li key={`order-product-${product.id}`}>
                            <span>{product.name}</span>
                            <span>x{product.actualCount}</span>
                          </li>
                        );
                      })
                    }
                  </ul>
                </aside>
              )
              : null
          }
        </div>
      );
    }

    return (
      <div>
        Hello drive
        <section>
          {
            ...this.state.userRoutes.map((route: Route) => (
              <article key={`route-${route.id}`} onClick={() => { this.selectRoute(route) }}>
                <header>{route.status}</header>
                <section>
                  <ul>
                    {
                      ...route.users.map((user: Worker) => (
                        <li>{new Worker(user).name}</li>
                      ))
                    }
                  </ul>
                </section>
                <footer>{route.date}</footer>
              </article>
            ))
          }
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

export default connect(mapStateToProps, () => ({}))(DriveComponent);

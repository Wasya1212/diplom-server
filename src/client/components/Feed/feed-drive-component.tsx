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

// import "../../assets/images/way.png";

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
  mapPitch?: number,
  leftWay: number,
  drivingSpeed: number,
  nextWayDirection: string
}

class DriveComponent extends Component<any, DriveState> {
  private _timer;
  private _drivetimer;
  private _socket = this.props.store.web_socket;

  state = {
    userRoutes: [],
    selectedRoute: undefined,
    selectedOrder: undefined,
    _map: undefined,
    cars: [],
    drivingMode: false,
    mapCenter: undefined,
    mapBearing: undefined,
    mapZoom: undefined,
    mapPitch: undefined,
    leftWay: 0,
    drivingSpeed: 0,
    nextWayDirection: 'throught'
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

    console.log(map);

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
    let pointWeight = driveImitation[startPosition].distance / points.length;
    let nextRotateRouteAngle = driveImitation[startPosition].angle - driveImitation[startPosition + 1].angle;

    if (nextRotateRouteAngle < 30) {
      this.setState({ nextWayDirection: 'left' });
    } else if (nextRotateRouteAngle > 30) {
      this.setState({ nextWayDirection: 'right' });
    } else {
      this.setState({ nextWayDirection: 'throught' });
    }

    this.setState({
      cars: [{ position: driveImitation[0].from }],
      drivingSpeed: 45
    });

    this._timer = setInterval(() => {
      if (startPosition >= driveImitation.length) {
        this.endDriveImitation();
        return;
      }

      if (currentIndex + 2 >= points.length) {
        startPosition++;
        points = Object3DMapController.breakRouteToPoints(driveImitation[startPosition].from, driveImitation[startPosition].to);
        currentIndex = 0;

        if (startPosition < driveImitation.length) {
          try {
            const nextRotateRouteAngle = driveImitation[startPosition].angle - driveImitation[startPosition - 1].angle;
            if (nextRotateRouteAngle < 30) {
              this.setState({ nextWayDirection: 'left' });
            } else if (nextRotateRouteAngle > 30) {
              this.setState({ nextWayDirection: 'right' });
            } else {
              this.setState({ nextWayDirection: 'throught' });
            }
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        currentIndex += 2;
        pointWeight = driveImitation[startPosition].distance / points.length;
      }

      this.setState({
        cars: [{
          position: points[currentIndex],
          rotation: driveImitation[startPosition].angle
        }],
        mapCenter: points[currentIndex],
        mapZoom: 20,
        mapBearing: -driveImitation[startPosition].angle,
        mapPitch: 65,
        leftWay: +(driveImitation[startPosition].distance - (pointWeight * currentIndex)).toFixed(0)
      });
    }, 300);

    this._drivetimer = setInterval(() => {
      this._socket.emit('drive', {
        route: this.state.selectedRoute,
        projectId: this.props.store.current_project._id,
        timeline: {
          waypoint: points[currentIndex],
          speed: 45,
          date: Date.now()
        },
        workerId: this.props.store.user._id
      });
    }, 10000);
  }

  private endDriveImitation = async () => {
    try {
      await Route.closeRoute(this.props.store.current_project._id, (this.state.selectedRoute || new Route({})).id || '');
      clearInterval(this._timer);
      clearInterval(this._drivetimer);
      WaypointController.clearRoute(this.state._map);
      this.setState({
        cars: [], drivingMode: false,
        leftWay: 0,
        drivingSpeed: 0
      });
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
      // routeRotationAngle = routeRotationAngle > 30 ? routeRotationAngle - 55 : routeRotationAngle;

      routeRotationAngle -= 90;

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
          <article className="control-panel drive__control">
            <button onClick={this.deselectRoute}>Back</button>
            {
              this.state.drivingMode
                ?<button onClick={this.endDriveImitation}>End drive</button>
                : <button onClick={this.startDrive}>Start drive</button>
            }
          </article>
          <div className="drive-map__control">
            <Map
              center={this.state.mapCenter || route.waypoints[0]}
              markers={route.waypoints}
              zoom={this.state.mapZoom || 15}
              onLoad={this.handleMapLoad}
              cars={this.state.cars}
              bearing={this.state.mapBearing || 0}
              pitch={this.state.mapPitch || 0}
            />
            {this.state.leftWay != 0 ? <div className={`drive-map__control__road-way ${this.state.nextWayDirection}`}>{this.state.leftWay} m.</div> : null}
            {this.state.drivingSpeed ? <div className="drive-map__control__speed">{this.state.drivingSpeed}</div> : null}
          </div>
          {
            this.state.selectedOrder
              ? (
                <aside className="drive-point-details">
                  <button className="button" onClick={this.deselectWaypoint}>Close</button>
                  <p className="drive-point-details__order-details">Order #{(this.state.selectedOrder || new Order({})).number}</p>
                  <p className="drive-point-details__order-details">>Registred by: {new Worker((this.state.selectedOrder || new Order({})).operator).name}</p>
                  <ul>
                    {
                      ...(this.state.selectedOrder || new Order({})).workers.map(w => {
                        const worker = new Worker(w);
                        return (
                          <li key={`order-worker-${worker.id}`}>
                            <span className="drive-point-details__user-name">{worker.name}</span>
                            <div className="drive-point-details__user-img"><img src={worker.photo}/></div>
                          </li>
                        );
                      })
                    }
                  </ul>
                  <p className="drive-point-details__order-details">{'>'}Delivery address: {(this.state.selectedOrder || new Order({})).address}</p>
                  <p className="drive-point-details__order-details">{'>'}Description: {(this.state.selectedOrder || new Order({})).description}</p>
                  <p className="drive-point-details__order-details">{'>'}Delivery date: {((this.state.selectedOrder || new Order({})).deliveryDate || '').toString().slice(0, 10)}</p>
                  <ul className="drive-point-details__product-list">
                    {
                      ...((this.state.selectedOrder || new Order({})).products || []).map(p => {
                        const product = new Product(p.product);
                        return (
                          <li key={`order-product-${product.id}`}>
                            <span className="drive-point-details__order-name">{product.name}</span>
                            <span className="drive-point-details__order-count">x{product.actualCount}</span>
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
        <section className="routes-list">
          {
            ...this.state.userRoutes.map((route: Route) => (
              <article className="route-info route-container" key={`route-${route.id}`} onClick={() => { this.selectRoute(route) }}>
                <header className="route-info__status">
                  <span className={`${route.status}-span status-span`}>{route.status}</span>
                </header>
                <section className="route-info__workers-list">
                  <ul>
                    {
                      ...route.users.map((user: Worker) => (
                        <li className="route-info__workers-list__item">{new Worker(user).name}</li>
                      ))
                    }
                  </ul>
                </section>
                <footer className="route-info__date">{(route.date || '').toString().slice(0, 10)}</footer>
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

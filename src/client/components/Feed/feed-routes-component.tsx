import React, { Component } from "react";

import { connect } from "react-redux";

import { Order } from "../../utils/order";
import { Worker } from "../../utils/worker";
import { Route } from "../../utils/route";

import axios from "axios";

import { MapComponent as Map, Coordinates } from "../../utils/map";
import { WaypointController } from "../../utils/waypointMapController";

import Modal from "../Modal";

interface AddRouteFormProps {
  projectId: string,
  authToken?: string
}

interface AddRouteFormState {
  ordersList: Order[],
  selectedOrdersList: Order[],
  connParams?: any,
  checkpoints: Coordinates[],
  mapCenter?: Coordinates,
  mapZoom?: number,
  ordersSelectedWorkersList: Worker[],
  ordersWorkersList: Worker[],
  _map: any,
  checkedRoute: string,
  connection: any
}

class AddRouteForm extends Component<AddRouteFormProps, AddRouteFormState> {
  routeDeliveryDateInputRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();

  state = {
    connParams: this.props.authToken ? { connection: { headers: [ { title: 'authorization', value: this.props.authToken } ] } } : undefined,
    ordersList: [],
    checkpoints: [],
    mapCenter: undefined,
    mapZoom: undefined,
    ordersSelectedWorkersList: [],
    ordersWorkersList: [],
    checkedRoute: '',
    _map: undefined,
    connection: this.props.authToken ? { connection: { headers: [{ title: 'authorization', value: this.props.authToken }] } } : undefined,
    selectedOrdersList: []
  }

  componentDidMount() {
    Order
      .getOrders(this.props.projectId, this.state.connParams)
      .then((orders: Order[]) => {
        console.log("ORDERS", orders)
        this.setState({
          ordersList: orders
        });

        return orders;
      })
      .then((orders: Order[]) => {
        let workers: Worker[] = [];

        orders.forEach((order: Order) => {
          order.workers.forEach((w: any) => {
            if (workers.map(w => w.id).indexOf(w._id) == -1) {
              workers.push(new Worker(w));
            }
          });
        });

        this.setState({
          ordersWorkersList: workers
        });
      })
      .then(() => {
        this.getCheckpointsFromCheckboxes();
      });
  }

  getCheckpointsFromCheckboxes() {
    let selectedOrdersInputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('.order-checkbox-input');

    this.setState({
      checkpoints: Array.from(selectedOrdersInputs).map((input: HTMLInputElement) => {
        if (input.checked) {
          return JSON.parse(input.value);
        }
      }).filter(coordinate => coordinate != undefined)
    });
  }

  onOrderCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.getCheckpointsFromCheckboxes();
    this.setState({
      mapCenter: JSON.parse(e.currentTarget.value),
      mapZoom: 15
    });

    if (e.currentTarget.checked) {
      this.setState({
        selectedOrdersList: [...this.state.selectedOrdersList, this.state.ordersList[this.state.ordersList.findIndex((o: Order) => `order-checkbox-${o.id}` == e.currentTarget.id)]]
      });
    } else {
      let orders = this.state.selectedOrdersList;
      orders.splice(orders.findIndex((o: Order) => `order-checkbox-${o.id}` == e.currentTarget.id), 1);
      this.setState({ selectedOrdersList: orders });
    }
  }

  onOrderWorkerCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      this.setState({
        ordersSelectedWorkersList: [...this.state.ordersSelectedWorkersList, this.state.ordersWorkersList[this.state.ordersWorkersList.findIndex((w: Worker) => w.id == e.currentTarget.value)]]
      });
    } else {
      let workers = this.state.ordersSelectedWorkersList;
      workers.splice(workers.findIndex((w: Worker) => w.id == e.currentTarget.value), 1);
      this.setState({ ordersSelectedWorkersList: workers });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.checkpoints != this.state.checkpoints) {
      if (this.state._map && this.state._map != undefined && this.state.checkpoints) {
        if (this.state.checkpoints && this.state.checkpoints.length < 2) {
          WaypointController.clearRoute(this.state._map);
          return;
        }

        WaypointController
          .createRoute(this.state.checkpoints)
          .then(route => {
            WaypointController.drawRoute(this.state._map, route);

            this.setState({ checkedRoute: WaypointController.encodeRoute(route) });
          });
      }
    }
  }

  onLoadMap = (map: any) => {
    this.setState({ _map: map });
  }

  addRoute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const deliveryDateInput: HTMLInputElement = this.routeDeliveryDateInputRef.current || new HTMLInputElement();

    Route.addRoute(this.props.projectId, {
      users: this.state.ordersSelectedWorkersList,
      orders: this.state.selectedOrdersList,
      plannedRoute: this.state.checkedRoute,
      waypoints: this.state.checkpoints,
      date: deliveryDateInput.value
    }, this.state.connection);
  }

  render() {
    return (
      <section>
        <form className="form" onSubmit={this.addRoute}>
          <header>

          </header>
          <section>
            <p>
              <input className="input" ref={this.routeDeliveryDateInputRef} name="routeDate" type="date" />
            </p>
            <p>
              <h4>Workers:</h4>
              {
                ...this.state.ordersWorkersList.map((worker: Worker) => (
                  <p className="checkbox" key={`order-worker-checkbox-container-${worker.id}`}>
                    <label className="order-worker-checkbox-label" htmlFor={`order-worker-checkbox-${worker.id}`}>{`${worker.name}`}</label>
                    <input onChange={this.onOrderWorkerCheckboxChange} value={worker.id} className="order-worker-checkbox-input" id={`order-worker-checkbox-${worker.id}`} type="checkbox" />
                  </p>
                ))
              }
            </p>
          </section>
          <aside>
            <h4>Waypoints:</h4>
            {
              ...this.state.ordersList.map((order: Order) => (
                <p className="checkbox" key={`order-checkbox-container-${order.id}`}>
                  <label className="order-checkbox-label" htmlFor={`order-checkbox-${order.id}`}>{`#${order.number} (${order.address})`}</label>
                  <input onChange={this.onOrderCheckboxChange} value={JSON.stringify(order.pointOnMap)} className="order-checkbox-input" id={`order-checkbox-${order.id}`} type="checkbox" />
                </p>
              ))
            }
          </aside>
          <button className="button">Confirm</button>
        </form>
        <article className="form-map">
          <Map
            onLoad={this.onLoadMap}
            center={this.state.mapCenter}
            zoom={this.state.mapZoom}
            markers={this.state.checkpoints}
          />
        </article>
      </section>
    );
  }
}

interface RouteComponentState {
  addRouteModalIsOpen: boolean,
  currentZoom: number,
  currentPosition: Coordinates,
  routes: Route[],
  activeDrivers: any[],
  carsSize: number
}

class RouteComponent extends Component<any, RouteComponentState> {
  private _socket = this.props.store.web_socket;

  state = {
    currentPosition: { lng: 24.021847295117936, lat: 49.85496650618947 },
    currentZoom: 15,
    addRouteModalIsOpen: false,
    routes: [],
    activeDrivers: [],
    cars: [],
    carsSize: 1
  }

  constructor(props) {
    super(props);

    this._socket.emit('join', this.props.store.current_project._id);
    this._socket.on('join', result => {
      console.log(result);
    });
    this._socket.on('drive', driveData => {
      const driverIndex = this.state.activeDrivers.findIndex((d: any) => d.workerId == driveData.workerId);

      if (driverIndex >= 0) {
        let updatedDriveInfo: any[] = this.state.activeDrivers;
        updatedDriveInfo[driverIndex] = driveData;

        this.setState({ activeDrivers: updatedDriveInfo });
      } else {
        this.setState({
          activeDrivers: [...this.state.activeDrivers, driveData],
        });
      }
    });
  }

  onMapZoom = (map) => {
    if (map.getZoom() >= 16) {
      this.setState({ carsSize: 0.2 });
    } else if (map.getZoom() >= 13.5) {
      this.setState({ carsSize: 2.2 });
    } else if (map.getZoom() >= 12.2) {
      this.setState({ carsSize: 10 });
    }
  }

  componentDidMount() {
    this.getAllRoutes();
  }

  async getAllRoutes() {
    this.setState({
      routes: await Route.find(this.props.store.current_project._id, { status: 'processing' })
    });
  }

  handleMapClick = (e: any) => {
    console.log(e.lngLat.wrap());
  }

  showAddRouteModal = () => {
    this.setState({ addRouteModalIsOpen: true });
  }

  closeAddRouteModal = () => {
    this.setState({ addRouteModalIsOpen: false });
  }

  goToSelectedRoute = (routeId: string) => {
    const selectedRoute: any = this.state.activeDrivers.filter((info: any) => info.route._parameters.id == routeId)[0];

    if (selectedRoute) {
      this.setState({ currentPosition: selectedRoute.timeline.waypoint });
    }
  }

  render() {
    return (
      <div>
        <article className="control-panel routes__control">
          <menu>
            <div>
              <input id="current-routes-checkbox" name="routes" type="checkbox" />
              <label htmlFor="current-routes-checkbox">Show current routes</label>
            </div>
            <div>
              <input id="current-routes-plannedRoute" name="plannedRoute" type="checkbox" />
              <label htmlFor="current-routes-plannedRoute">Show planned route</label>
            </div>
            <div>
              <input id="current-routes-waypoints" name="waypoint" type="checkbox" />
              <label htmlFor="current-routes-waypoints">Show waypoints</label>
            </div>
          </menu>
          <button onClick={this.showAddRouteModal}>Add Route</button>
        </article>
        <article className="routes-list-container">
          <ul className="routes-list">
            {
              ...this.state.routes.map((route: Route) => (
                <li onClick={() => { this.goToSelectedRoute(route.id || ''); }} className="routes-list__item">
                  <span className="route-date">{(route.date || '').toString().slice(0, 10)}</span>
                  <ul className="route-workers">
                    {
                      ...route.users.map(user => (
                        <li>{new Worker(user).name}</li>
                      ))
                    }
                  </ul>
                </li>
              ))
            }
          </ul>
        </article>
        <article className="routes-map">
          <Map
            onZoom={this.onMapZoom}
            center={this.state.currentPosition}
            onClick={this.handleMapClick}
            zoom={this.state.currentZoom}
            cars={this.state.activeDrivers.map((d: any) => ({
              position: d.timeline.waypoint,
              size: this.state.carsSize
            }))}
          />
        </article>
        <Modal isOpen={this.state.addRouteModalIsOpen} onClose={this.closeAddRouteModal}>
          <AddRouteForm authToken={this.props.store.auth_token} projectId={this.props.store.current_project._id} />
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

export default connect(mapStateToProps, () => ({}))(RouteComponent);

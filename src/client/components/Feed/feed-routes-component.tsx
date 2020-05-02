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
        <form onSubmit={this.addRoute}>
          <header>

          </header>
          <section>
            <p>
              <input ref={this.routeDeliveryDateInputRef} name="routeDate" type="date" />
            </p>
            <p>
              {
                ...this.state.ordersWorkersList.map((worker: Worker) => (
                  <p key={`order-worker-checkbox-container-${worker.id}`}>
                    <label className="order-worker-checkbox-label" htmlFor={`order-worker-checkbox-${worker.id}`}>{`${worker.name}`}</label>
                    <input onChange={this.onOrderWorkerCheckboxChange} value={worker.id} className="order-worker-checkbox-input" id={`order-worker-checkbox-${worker.id}`} type="checkbox" />
                  </p>
                ))
              }
            </p>
          </section>
          <aside>
            {
              ...this.state.ordersList.map((order: Order) => (
                <p key={`order-checkbox-container-${order.id}`}>
                  <label className="order-checkbox-label" htmlFor={`order-checkbox-${order.id}`}>{`#${order.number} (${order.address})`}</label>
                  <input onChange={this.onOrderCheckboxChange} value={JSON.stringify(order.pointOnMap)} className="order-checkbox-input" id={`order-checkbox-${order.id}`} type="checkbox" />
                </p>
              ))
            }
          </aside>
          <button>Confirm</button>
        </form>
        <Map
          onLoad={this.onLoadMap}
          center={this.state.mapCenter}
          zoom={this.state.mapZoom}
          markers={this.state.checkpoints}
        />
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
    // cars: [
    //   { position: { lng: 24.021847295117936, lat: 49.85496650618947 } },
    //   { position: { lng: 24.027847295117936, lat: 49.85896650618947 } },
    //   { position: { lng: 24.015847295117936, lat: 49.86296650618947 } },
    //   { position: { lng: 24.031847295117936, lat: 49.86696650618947 } },
    //   { position: { lng: 24.011847295117936, lat: 49.87296650618947 } },
    //   { position: { lng: 24.001847295117936, lat: 49.87296650618947 } },
    //   { position: { lng: 24.041847295117936, lat: 49.87296650618947 } }
    // ]
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
      routes: await Route.getRoutes(this.props.store.current_project._id)
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

  render() {
    return (
      <div>
        <ul>
          {
            ...this.state.routes.map((route: Route) => (
              <li>{`${route.date} ${route.users.map(user => new Worker(user).name).join(', ')}`}</li>
            ))
          }
        </ul>
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
        <button onClick={this.showAddRouteModal}>Add Route</button>
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

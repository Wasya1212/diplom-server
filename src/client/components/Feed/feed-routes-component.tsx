import React, { Component } from "react";

import { connect } from "react-redux";

import { Order } from "../../utils/order";
import { Worker } from "../../utils/worker";

import axios from "axios";

import { MapComponent as Map, Coordinates } from "../../utils/map";

import Modal from "../Modal";

interface AddRouteFormProps {
  projectId: string,
  authToken?: string
}

interface AddRouteFormState {
  ordersList: Order[],
  connParams?: any,
  checkpoints: Coordinates[],
  mapCenter?: Coordinates,
  mapZoom?: number,
  ordersSelectedWorkersList: Worker[],
  ordersWorkersList: Worker[]
}

class AddRouteForm extends Component<AddRouteFormProps, AddRouteFormState> {
  state = {
    connParams: this.props.authToken ? { connection: { headers: [ { title: 'authorization', value: this.props.authToken } ] } } : undefined,
    ordersList: [],
    checkpoints: [],
    mapCenter: undefined,
    mapZoom: undefined,
    ordersSelectedWorkersList: [],
    ordersWorkersList: []
  }

  componentDidMount() {
    Order
      .getOrders(this.props.projectId, this.state.connParams)
      .then((orders: Order[]) => {
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

  render() {
    return (
      <section>
        <form>
          <header>

          </header>
          <section>
            <p>
              <input name="routeDate" type="date" />
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
        </form>
        <Map
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
  currentPosition: Coordinates
}

class RouteComponent extends Component<any, RouteComponentState> {
  state = {
    currentPosition: { lng: 24.021847295117936, lat: 49.85496650618947 },
    currentZoom: 15,
    addRouteModalIsOpen: false
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

  componentDidMount() {

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
        Hello routes
        <Map
          center={this.state.currentPosition}
          onClick={this.handleMapClick}
          zoom={this.state.currentZoom}
          // cars={this.state.cars}
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

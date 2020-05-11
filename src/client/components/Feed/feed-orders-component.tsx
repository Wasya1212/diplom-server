import React, { Component } from "react";

import { connect } from "react-redux";

import { Order } from "../../utils/order";
import { Worker } from "../../utils/worker";
import { Product } from "../../utils/product";

import Modal from "../Modal";
import { MapComponent as Map, Coordinates } from "../../utils/map";

interface OrderComponentState {
  orders: Order[],
  addOrderModal: boolean
}

interface CreateOrderFormProps {
  onData?: (order: Order) => void,
  onError?: (err) => void,
  onSubmit?: () => void,
  afterSubmit?: () => void,
  authToken?: string,
  projectId: string,
  currentUserId: string
}

interface CreateOrderFormState {
  mapCenter?: Coordinates,
  checkedPoint?: Coordinates,
  connParams: any,
  workersList: Worker[],
  productsList: Product[],
  selectedProductsList: SelectedProduct[],
  selectedWorkersList: Worker[]
}

interface SelectedProduct {
  product: Product,
  count: number
}

class CreateOrderForm extends Component<CreateOrderFormProps, CreateOrderFormState> {
  orderDeliveryDateInputRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
  descriptionTextAreaRef: React.RefObject<HTMLTextAreaElement> = React.createRef<HTMLTextAreaElement>();
  productsSelectRef: React.RefObject<HTMLSelectElement> = React.createRef<HTMLSelectElement>();
  productCountInputRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
  workersSelectRef: React.RefObject<HTMLSelectElement> = React.createRef<HTMLSelectElement>();

  state: CreateOrderFormState = {
    connParams: this.props.authToken ? { connection: { headers: [ { title: 'authorization', value: this.props.authToken } ] } } : undefined,
    workersList: [],
    productsList: [],
    selectedProductsList: [],
    selectedWorkersList: []
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Worker
      .getWorkers(this.props.projectId)
      .then((workers: Worker[]) => {
        this.setState({ workersList: workers });
      });

    Product
      .getProducts(this.props.projectId)
      .then((products: Product[]) => {
        this.setState({ productsList: products });
      });
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (this.props.onSubmit) {
      try {
        this.props.onSubmit();
      } catch (err) {
        console.error(err);
      }
    }

    const deliveryDateInput: HTMLInputElement = this.orderDeliveryDateInputRef.current || new HTMLInputElement();
    const descriptionTextArea: HTMLTextAreaElement = this.descriptionTextAreaRef.current || new HTMLTextAreaElement();

    Order
      .addOrder(
        this.props.projectId,
        new Order({
          deliveryDate: deliveryDateInput.value,
          workers: this.state.selectedWorkersList,
          address: "Some address",
          pointOnMap: this.state.checkedPoint,
          description: descriptionTextArea.value,
          products: this.state.selectedProductsList,
          operator: this.props.currentUserId,
        }),
        this.state.connParams
      )
      .then((order: Order) => {
        if (this.props.onData) {
          this.props.onData(order);
        }
      })
      .then(() => {
        if (this.props.afterSubmit) {
          try {
            this.props.afterSubmit();
          } catch (err) {
            console.error(err);
          }
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleMapClick = (e: any) => {
    try {
      const checkedCoordinates: Coordinates = e.lngLat.wrap();

      this.setState({
        mapCenter: checkedCoordinates,
        checkedPoint: checkedCoordinates
      });
    } catch (err) {
      console.error(err);
    }
  }

  addProductToListOfSelectedProducts = () => {
    const productsSelect: HTMLSelectElement = this.productsSelectRef.current || new HTMLSelectElement();
    const productCountInput: HTMLInputElement = this.productCountInputRef.current || new HTMLInputElement();

    const selectedProductIndex: number = this.state.productsList.findIndex((p: Product) => p.id == productsSelect.value);

    if (selectedProductIndex == -1 || +productCountInput.value <= 0) {
      return;
    }

    const productIsSelectedIndex: number = this.state.selectedProductsList.findIndex(p => p.product.id == productsSelect.value);

    if (productIsSelectedIndex == -1) {
      const selectedProduct: SelectedProduct = {
        product: this.state.productsList[selectedProductIndex],
        count: +productCountInput.value
      };

      if (+productCountInput.value <= (this.state.productsList[selectedProductIndex].actualCount || 0)) {
        this.setState({
          selectedProductsList: [selectedProduct, ...this.state.selectedProductsList]
        });
      }
    } else {
      let products = this.state.selectedProductsList;
      products[productIsSelectedIndex].count += +productCountInput.value;

      if (products[productIsSelectedIndex].count <= (this.state.productsList[selectedProductIndex].actualCount || 0)) {
        this.setState({
          selectedProductsList: products
        });
      }
    }
  }

  removeProductFromListOfSelectedProducts = (productId: string) => {
    const productIndex: number = this.state.selectedProductsList.findIndex((p: SelectedProduct) => p.product.id == productId);

    if (productIndex != -1) {
      let products = this.state.selectedProductsList;
      products.splice(productIndex, 1);

      this.setState({ selectedProductsList: products });
    }
  }

  removeWorkerFromListOfSelectedWorkers = (workerId: string) => {
    const workerIndex: number = this.state.selectedWorkersList.findIndex((w: Worker) => w.id == workerId);

    if (workerIndex != -1) {
      let workers = this.state.selectedWorkersList;
      workers.splice(workerIndex, 1);

      this.setState({ selectedWorkersList: workers });
    }
  }

  addWorkerToListOfSelectedProducts = () => {
    const workersSelect: HTMLSelectElement = this.workersSelectRef.current || new HTMLSelectElement();

    const selectedWorkerIndex: number = this.state.workersList.findIndex((w: Worker) => w.id == workersSelect.value);
    const listWorkerIndex: number = this.state.selectedWorkersList.findIndex((w: Worker) => w.id == workersSelect.value);

    if (selectedWorkerIndex != -1 && listWorkerIndex == -1) {
      this.setState({
        selectedWorkersList: [this.state.workersList[selectedWorkerIndex], ...this.state.selectedWorkersList]
      });
    }
  }

  render() {
    return (
      <form className="form" onSubmit={this.handleSubmit}>
        <p>
          <label>Order delivery date</label>
          <input className="input" type="date" ref={this.orderDeliveryDateInputRef} name="deliveryDate" placeholder="Delivery date" />
        </p>
        <p>
          <label>Order description</label>
          <textarea className="input" ref={this.descriptionTextAreaRef} name="description" placeholder="Description"></textarea>
        </p>
        <p>
          <label>Workers</label>
          <select className="input" name="orderWorkers" ref={this.workersSelectRef}>
            {
              ...this.state.workersList.map((worker: Worker) => {
                return (
                  <option key={`option-worker-${worker.id}`} value={worker.id}>{worker.name}</option>
                );
              })
            }
          </select>
          <input className="button" type="button" onClick={this.addWorkerToListOfSelectedProducts} value="Select Worker" />
          <ul>
            {
              ...this.state.selectedWorkersList.map((selectedWorker: Worker, index: number) => {
                return (
                  <li key={`selected-product-${index}`}>
                    {`${selectedWorker.name}`}
                    <input className="button" type="button" onClick={() => {this.removeWorkerFromListOfSelectedWorkers(selectedWorker.id || '')}} value="X" />
                  </li>
                );
              })
            }
          </ul>
        </p>
        <p>
          <label>Products</label>
          <select className="input" name="orderProducts" ref={this.productsSelectRef}>
            {
              ...this.state.productsList.map((product: Product) => {
                return (
                  <option key={`option-product-${product.id}`} value={product.id}>{`${product.name} (${product.category}, count: ${product.actualCount})`}</option>
                );
              })
            }
          </select>
          <input className="input" ref={this.productCountInputRef} type="number" placeholder="Products count..." required />
          <input className="button" type="button" onClick={this.addProductToListOfSelectedProducts} value="Select Product" />
          <ul>
            {
              ...this.state.selectedProductsList.map((selectedProduct: SelectedProduct, index: number) => {
                return (
                  <li key={`selected-product-${index}`}>
                    {`${selectedProduct.product.name} x:${selectedProduct.count}`}
                    <input className="button" type="button" onClick={() => {this.removeProductFromListOfSelectedProducts(selectedProduct.product.id || '')}} value="X" />
                  </li>
                );
              })
            }
          </ul>
        </p>
        <article className="form-map">
          <Map
            center={this.state.mapCenter}
            onClick={this.handleMapClick}
            router={{}}
          />
        </article>
        <button className="button">confirm</button>
      </form>
    );
  }
}

class OrderComponent extends Component<any, OrderComponentState> {
  state = {
    orders: [],
    addOrderModal: false
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.findAllOrders();
  }

  findAllOrders() {
    Order
      .getOrders(
        this.props.store.current_project._id,
        {
        connection: {
          headers: [
            { title: 'authorization', value: this.props.store.auth_token }
          ]
        }
      })
      .then((orders: Order[]) => {
        console.log(orders)
        this.setState({ orders });
      })
      .catch(err => {
        console.error(err);
      });
  }

  closeAddOrderModal = () => {
    this.setState({
      addOrderModal: false
    });
  }

  showAddOrderModal = () => {
    this.setState({
      addOrderModal: true
    });
  }

  addOrder = (order: Order) => {
    this.findAllOrders();
  }

  render() {
    return (
      <div>
        <article className="control-panel orders__control">
          <button onClick={this.showAddOrderModal}>Add order</button>
        </article>
        <article className="orders__list">
          <ul className="table">
            {
              this.state.orders.length > 0
                ? (
                  <li className="table__item table__title orders__list__title">
                    <div>number #</div>
                    <div>address</div>
                    <div>workers</div>
                    <div>products</div>
                    <div>delivery date</div>
                    <div>description</div>
                    <div>operator</div>
                  </li>
                )
                : (
                  <li>Any orders was found!</li>
                )
            }
            {
              ...this.state.orders.map((order: Order) => (
                <li key={`order-${order.id}`} className={`table__item orders__list__product-${order.id}`}>
                  <div>#{order.number}</div>
                  <div>{order.address}</div>
                  <div>{(order.workers || []).length}</div>
                  <div>{(order.products || []).length}</div>
                  <div>{(order.deliveryDate || '').toString().slice(0, 10)}</div>
                  <div>{order.description}</div>
                  <div>{ (new Worker(order.operator || {})).name}</div>
                </li>
              ))
            }
          </ul>
        </article>
        <Modal isOpen={this.state.addOrderModal} onClose={this.closeAddOrderModal}>
          <CreateOrderForm
            projectId={this.props.store.current_project._id}
            currentUserId={this.props.store.user._id}
            authToken={this.props.store.auth_token}
            onData={this.addOrder}
            afterSubmit={this.closeAddOrderModal}
          />
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

export default connect(mapStateToProps, () => ({}))(OrderComponent);

import React, { Component } from "react";

import { connect } from "react-redux";

import { Order } from "../../utils/order";

import Modal from "../Modal";

interface OrderComponentState {
  orders: Order[],
  addOrderModal: boolean
}

class OrderComponent extends Component<any, OrderComponentState> {
  orderDeliveryDateInputRef: React.RefObject<HTMLInputElement>;

  state = {
    orders: [],
    addOrderModal: false
  }

  constructor(props) {
    super(props);

    this.orderDeliveryDateInputRef = React.createRef<HTMLInputElement>();
  }

  componentDidMount() {
    console.log({ title: 'authorization', value: this.props.store })
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
        this.setState({ orders });
      })
      .catch(err => {
        console.error(err);
      });
  }

  addOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const deliveryDateInput: HTMLInputElement = this.orderDeliveryDateInputRef.current || new HTMLInputElement();

    Order
      .addOrder(
        this.props.store.current_project._id,
        new Order({
          deliveryDate: deliveryDateInput.value
        }),
        {
          connection: {
            headers: [
              { title: 'authorization', value: this.props.store.auth_token }
            ]
          }
        }
      )
      .then((order: Order) => {
        console.log("gfsdgdsfg", order)
        this.setState({ orders: [ order, ...this.state.orders ] });
      })
      .then(() => {
        this.closeAddOrderModal();
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

  render() {
    return (
      <div>
        <article className="orders__control">
          <button onClick={this.showAddOrderModal}>Add order</button>
        </article>
        <article className="orders__list">
          <ul>
            {
              this.state.orders.length > 0
                ? (
                  <li className="orders__list__title">
                    <div>number #</div>
                    <div>address</div>
                    <div>workers</div>
                    <div>products</div>
                    <div>delivery date</div>
                    <div>operator</div>
                  </li>
                )
                : (
                  <li>Any orders was found!</li>
                )
            }
            {
              ...this.state.orders.map((order: Order) => (
                <li key={`order-${order.id}`} className={`orders__list__product-${order.id}`}>
                  <div>{order.number}</div>
                  <div>{order.address}</div>
                  <div>{(order.workers || []).length}</div>
                  <div>{(order.products || []).length}</div>
                  <div>{order.deliveryDate}</div>
                  <div>{(order.operator || {}).name}</div>
                </li>
              ))
            }
          </ul>
        </article>
        <Modal isOpen={this.state.addOrderModal} onClose={this.closeAddOrderModal}>
          <form onSubmit={this.addOrder}>
            <input type="date" ref={this.orderDeliveryDateInputRef} name="deliveryDate" placeholder="Delivery date" />
            <button>confirm</button>
          </form>
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

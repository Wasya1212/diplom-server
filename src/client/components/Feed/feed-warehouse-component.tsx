import React, { Component } from "react";

import { connect } from "react-redux";

import { Product } from "../../utils/product";

import Modal from "../Modal";

interface WorkerComponentState {
  products: Product[],
  addProductModal: boolean
}

class WarehouseComponent extends Component<any, WorkerComponentState> {
  productCodeInputRef: React.RefObject<HTMLInputElement>;
  productCategoryInputRef: React.RefObject<HTMLInputElement>;
  productNameInputRef: React.RefObject<HTMLInputElement>;
  productCountInputRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);

    this.productCodeInputRef = React.createRef<HTMLInputElement>();
    this.productCategoryInputRef = React.createRef<HTMLInputElement>();
    this.productNameInputRef = React.createRef<HTMLInputElement>();
    this.productCountInputRef = React.createRef<HTMLInputElement>();
  }

  private getProducts(projectId: string) {
    Product
      .getProducts(
        projectId,
        {
        connection: {
          headers: [
            { title: 'authorization', value: this.props.store.auth_token }
          ]
        }
      })
      .then((products: Product[]) => {
        this.setState({ products });
      })
      .catch(err => {
        console.error(err);
      });
  }

  state = {
    products: [],
    addProductModal: false
  }

  showAddProductModal = () => {
    this.setState({ addProductModal: true });
  }

  closeAddProductModal = () => {
    this.setState({ addProductModal: false });
  }

  addProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const productCodeInput: HTMLInputElement = this.productCodeInputRef.current || new HTMLInputElement();
    const productNameInput: HTMLInputElement = this.productNameInputRef.current || new HTMLInputElement();
    const productCategoryInput: HTMLInputElement = this.productCategoryInputRef.current || new HTMLInputElement();
    const productCountInput: HTMLInputElement = this.productCountInputRef.current || new HTMLInputElement();

    Product
      .addProduct(
        this.props.store.current_project._id,
        {
          name: productNameInput.value,
          code: +productCodeInput.value,
          category: productCategoryInput.value,
          count: +productCountInput.value
        },
        {
          connection: {
            headers: [
              { title: 'authorization', value: this.props.store.auth_token }
            ]
          }
        }
      )
      .then((product: Product) => {
        console.log("added product:", product)
        this.setState({ products: [ product, ...this.state.products ] });
      })
      .then(() => {
        this.closeAddProductModal();
      })
      .then(() => { // update products
        this.getProducts(this.props.store.current_project._id);
      })
      .catch(err => {
        console.error(err);
      });
  }

  componentDidMount() {
    this.getProducts(this.props.store.current_project._id);
  }

  render() {
    return (
      <div>
        <article className="warehouse__control">
          <button onClick={this.showAddProductModal}>Add product</button>
        </article>
        <article className="products__list">
          <ul>
            {
              this.state.products.length > 0
                ? (
                  <li className="workers__list__title">
                    <div>code</div>
                    <div>name</div>
                    <div>category</div>
                    <div>actual count</div>
                    <div>reserved</div>
                  </li>
                )
                : (
                  <li>Any products was found!</li>
                )
            }
            {
              ...this.state.products.map((product: Product) => (
                <li key={`product-${product.id}`} className={`products__list__product-${product.id}`}>
                  <div>{product.code}</div>
                  <div>{product.name}</div>
                  <div>{product.category}</div>
                  <div>{product.actualCount}</div>
                  <div>{product.reserved}</div>
                </li>
              ))
            }
          </ul>
        </article>
        <Modal isOpen={this.state.addProductModal} onClose={this.closeAddProductModal}>
          <form onSubmit={this.addProduct}>
            <input type="text" ref={this.productCodeInputRef} name="code" placeholder="Product code" />
            <input type="text" ref={this.productCategoryInputRef} name="category" placeholder="Product category" />
            <input type="text" ref={this.productNameInputRef} name="name" placeholder="Product name" />
            <input type="text" ref={this.productCountInputRef} name="count" placeholder="Products count" />
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

export default connect(mapStateToProps, () => ({}))(WarehouseComponent);
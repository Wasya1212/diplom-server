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
        <article className="control-panel warehouse__control">
          <button onClick={this.showAddProductModal}>Add product</button>
        </article>
        <article className="products__list">
          <ul className="table">
            {
              this.state.products.length > 0
                ? (
                  <li className="table__item table__title workers__list__title">
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
                <li key={`product-${product.id}`} className={`table__item products__list__product-${product.id}`}>
                  <div className="product-code">{product.code}</div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">{product.category}</div>
                  <div className="product-actialCount">{product.actualCount}</div>
                  <div className="product-reserved">{product.reserved}</div>
                </li>
              ))
            }
          </ul>
        </article>
        <Modal isOpen={this.state.addProductModal} onClose={this.closeAddProductModal}>
          <form className="form" onSubmit={this.addProduct}>
            <p><input className="input" type="text" ref={this.productCodeInputRef} name="code" placeholder="Product code" /></p>
            <p><input className="input" type="text" ref={this.productCategoryInputRef} name="category" placeholder="Product category" /></p>
            <p><input className="input" type="text" ref={this.productNameInputRef} name="name" placeholder="Product name" /></p>
            <p><input className="input" type="text" ref={this.productCountInputRef} name="count" placeholder="Products count" /></p>
            <button className="button">confirm</button>
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

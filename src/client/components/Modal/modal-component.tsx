import React, { Component } from "react";

interface ModalProps {
  isOpen: boolean,
  onClose: () => void
}

export class Modal extends Component<ModalProps, any> {
  render() {
    if (this.props.isOpen == false) {
      return false;
    }

    return (
      <div className={"modal" + (this.props.isOpen ? "" : " modal-hidden hidden")}>
        <button className="modal__close-btn" onClick={this.props.onClose}>Close</button>
        <section className="modal__content">{this.props.children}</section>
      </div>
    );
  }
}

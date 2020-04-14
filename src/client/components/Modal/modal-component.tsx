import React, { Component } from "react";


export class Modal extends Component<{ isOpen: boolean }, any> {
  render() {
    return (
      <div className={"modal" + (this.props.isOpen ? "" : " modal-hidden hidden")}>{this.props.children}</div>
    );
  }
}

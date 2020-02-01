import React, { Component } from "react";

export interface GreeterProps { text?: String }

export class Greeter extends Component<GreeterProps, {}> {
  render() {
    return (
      <h1 className="greeting">{this.props.text}{this.props.children}</h1>
    );
  }
}

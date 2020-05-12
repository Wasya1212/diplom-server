import React, { Component } from "react";

import { SignUpForm } from "./sign-up-form-component";

interface SignUpState {
  isWorker: boolean
}

export class SignUp extends Component<{}, SignUpState> {
  state = {
    isWorker: false
  }

  chooseWorker = () => {
    this.setState({ isWorker: true });
  }

  chooseOwner = () => {
    this.setState({ isWorker: false });
  }

  render() {
    return (
      <main className="sign-up-component">
        <section className="sign-up-component__control">
          <button className="button" disabled={!this.state.isWorker} onClick={this.chooseOwner}>Owner</button>
          <button className="button" disabled={this.state.isWorker}  onClick={this.chooseWorker}>Worker</button>
        </section>
        <SignUpForm isWorker={this.state.isWorker} />
      </main>
    );
  }
}

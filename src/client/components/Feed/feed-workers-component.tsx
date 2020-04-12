import React, { Component } from "react";


import { Worker } from "../../utils/worker";

interface WorkerComponentState {
  workers: Worker[]
}

export class WorkerComponent extends Component<{}, WorkerComponentState> {
  state = {
    workers: []
  }

  componentDidMount() {
    Worker
      .getWorkers()
      .then((workers: Worker[]) => {
        this.setState({ workers });
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    return (
      <div>Hello workers</div>
    );
  }
}

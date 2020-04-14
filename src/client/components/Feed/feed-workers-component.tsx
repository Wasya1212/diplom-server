import React, { Component } from "react";

import { connect } from "react-redux";

import { Worker } from "../../utils/worker";

import Modal from "../Modal";

interface WorkerComponentState {
  workers: Worker[],
  addWorkerModal: boolean
}

class WorkerComponent extends Component<any, WorkerComponentState> {
  state = {
    workers: [],
    addWorkerModal: false
  }

  componentDidMount() {
    console.log({ title: 'authorization', value: this.props.store })
    Worker
      .getWorkers(
        this.props.store.current_project._id,
        {
        connection: {
          headers: [
            { title: 'authorization', value: this.props.store.auth_token }
          ]
        }
      })
      .then((workers: Worker[]) => {
        this.setState({ workers });
      })
      .catch(err => {
        console.error(err);
      });
  }

  addWorker = (e) => {
    e.preventDefault();
    Worker
      .addWorker(
        "",
        "",
        {
          connection: {
            headers: [
              { title: 'authorization', value: this.props.store.auth_token }
            ]
          }
        }
      )
      .then((worker: Worker) => {
        this.setState({ workers: [ worker, ...this.state.workers ] });
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    return (
      <div className="workers">
        <article className="workers__list">
          <ul>
            {
              this.state.workers.length == 1
                ? (
                  <li className="workers__list__title">
                    <div>name</div>
                    <div>email</div>
                    <div>address</div>
                    <div>phone</div>
                    <div>post</div>
                  </li>
                )
                : (
                  <li>Any workers was found!</li>
                )
            }
            {
              ...this.state.workers.map((worker: Worker) => (
                <li key={`worker-${worker.id}`} className={`workers__list__worker-${worker.id}`}>
                  <div>{worker.name}</div>
                  <div>{worker.email}</div>
                  <div>{worker.address}</div>
                  <div>{worker.phone}</div>
                  <div>{worker.post}</div>
                </li>
              ))
            }
          </ul>
        </article>
        <Modal isOpen={this.state.addWorkerModal}>
          <form onSubmit={this.addWorker}>
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

export default connect(mapStateToProps, () => ({}))(WorkerComponent);

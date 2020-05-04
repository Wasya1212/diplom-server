import React, { Component } from "react";

import { connect } from "react-redux";

import { Worker } from "../../utils/worker";

import Modal from "../Modal";

interface WorkerComponentState {
  workers: Worker[],
  addWorkerModal: boolean
}

class WorkerComponent extends Component<any, WorkerComponentState> {
  workerIdInputRef: React.RefObject<HTMLInputElement>;

  state = {
    workers: [],
    addWorkerModal: false
  }

  constructor(props) {
    super(props);

    console.log("PROPS", this.props.store)

    this.workerIdInputRef = React.createRef<HTMLInputElement>();
  }

  componentDidMount() {
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

  addWorker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const workerInput: HTMLInputElement = this.workerIdInputRef.current || new HTMLInputElement();

    Worker
      .addWorker(
        this.props.store.current_project._id,
        workerInput.value,
        {
          connection: {
            headers: [
              { title: 'authorization', value: this.props.store.auth_token }
            ]
          }
        }
      )
      .then((worker: Worker) => {
        console.log("gfsdgdsfg", worker)
        this.setState({ workers: [ worker, ...this.state.workers ] });
      })
      .then(() => {
        workerInput.value = "";
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      });
  }

  closeModal = () => {
    this.setState({
      addWorkerModal: false
    });
  }

  showModal = () => {
    this.setState({
      addWorkerModal: true
    });
  }

  render() {
    return (
      <div className="workers">
        <article className="control-panel workers__control">
          <button className="add-worker-btn" onClick={this.showModal}>Add worker</button>
        </article>
        <article className="workers__list">
          <ul className="table">
            {
              this.state.workers.length > 0
                ? (
                  <li className="table__item table__title workers__list__item workers__list__title">
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
                <li key={`worker-${worker.id}`} className={`table__item workers__list__item workers__list__worker-${worker.id}`}>
                  <div className="worker-name">{worker.name}</div>
                  <div className="worker-email">{worker.email}</div>
                  <div className="worker-address">{worker.address}</div>
                  <div className="worker-phone">{worker.phone}</div>
                  <div className="worker-post">{worker.post}</div>
                </li>
              ))
            }
          </ul>
        </article>
        <Modal isOpen={this.state.addWorkerModal} onClose={this.closeModal}>
          <form onSubmit={this.addWorker}>
            <input type="text" ref={this.workerIdInputRef} name="workerId" placeholder="Worker ID" />
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

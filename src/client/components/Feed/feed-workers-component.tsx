import React, { Component } from "react";

import { connect } from "react-redux";

import { Worker } from "../../utils/worker";

import Modal from "../Modal";

interface WorkersAccessState {
  workers: Worker[],
  features: any
}

interface WorkersAccessProps {
  projectId: string
}

class WorkerAccess extends Component<WorkersAccessProps, WorkersAccessState> {
  workerSelectRef: React.RefObject<HTMLSelectElement>;

  state = {
    workers: [],
    features: {}
  }

  constructor(props) {
    super(props);
    this.workerSelectRef = React.createRef<HTMLSelectElement>();
  }

  componentDidMount = async () => {
    const workers: Worker[] = await Worker.getWorkers(this.props.projectId);

    this.setState({ workers: workers });

    if (workers.length >= 1) {
      await this.getFeatures(workers[0].id || "");
    }
  }

  private getFeatures = async (workerId: string) => {
    const workersFeatures: any = await Worker.getFeatures(this.props.projectId, workerId);
    this.setState({ features: workersFeatures });
  }

  private handleUserAccessSelect = (e: any) => {
    this.getFeatures(e.target.value);
  }

  private handleUserAccessChange = (e: any) => {
    e.preventDefault();
    const workerSelectRef: HTMLSelectElement = this.workerSelectRef.current || new HTMLSelectElement();
    Worker.setFeatures(this.props.projectId, workerSelectRef.value, this.state.features);
  }

  private changeFeature = (e: any) => {
    let newFeaturesState = this.state.features;
    newFeaturesState[e.currentTarget.name] = e.currentTarget.checked;

    this.setState({ features: newFeaturesState });
  }

  render() {
    return (
      <form onSubmit={this.handleUserAccessChange} className="form">
        <div>
          <select className="select" ref={this.workerSelectRef} onChange={this.handleUserAccessSelect}>
            {
              ...this.state.workers.map((w: any) => (
                <option value={w.id}>{w.name}</option>
              ))
            }
          </select>
        </div>
        <div>
          {
            ...Object.keys(this.state.features).map((feature: any, index: number) => (
              <p className="checkbox">
                <label htmlFor={`feature-${index}`}>{feature}</label>
                <input onChange={this.changeFeature} name={feature} id={`feature-${index}`} type="checkbox" checked={this.state.features[feature]} />
              </p>
            ))
          }
        </div>
        <button className="button">Confirm changes</button>
      </form>
    );
  }
}

interface WorkerComponentState {
  workers: Worker[],
  addWorkerModal: boolean,
  setWorkerAccessModal: boolean
}

class WorkerComponent extends Component<any, WorkerComponentState> {
  workerIdInputRef: React.RefObject<HTMLInputElement>;

  state = {
    workers: [],
    addWorkerModal: false,
    setWorkerAccessModal: false
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
      addWorkerModal: false,
      setWorkerAccessModal: false
    });
  }

  showModal = () => {
    this.setState({
      addWorkerModal: true
    });
  }

  showSetAccessModal = () => {
    this.setState({
      setWorkerAccessModal: true
    });
  }

  render() {
    //@ts-ignore
    console.log("WWWSAS", this.state.workers.length > 0 ? (this.state.workers[0].address || "address") : 0);

    return (
      <div className="workers">
        <article className="control-panel workers__control">
          <button className="access-worker-btn" onClick={this.showSetAccessModal}>Set access</button>
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
          <form className="form" onSubmit={this.addWorker}>
            <p><input className="input" type="text" ref={this.workerIdInputRef} name="workerId" placeholder="Worker ID" /></p>
            <button className="button">confirm</button>
          </form>
        </Modal>
        <Modal isOpen={this.state.setWorkerAccessModal} onClose={this.closeModal}>
          <WorkerAccess projectId={this.props.store.current_project._id}></WorkerAccess>
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

import React, { Component } from "react";

import { connect } from "react-redux";

import { Route } from "../../utils/route";
import { Worker } from "../../utils/worker";
import { MapComponent as Map, Coordinates } from "../../utils/map";

interface DriveState {
  userRoutes: Route[],
  selectedRoute?: Route
}

class DriveComponent extends Component<any, DriveState> {
  private _socket = this.props.store.web_socket;

  state = {
    userRoutes: [],
    selectedRoute: undefined
  }

  constructor(props) {
    super(props);

    this._socket.emit('join', this.props.store.current_project._id);
    this._socket.on('join', result => {
      console.log(result);
    });
  }

  componentDidMount() {
    Route
      .getRoutes(this.props.store.current_project._id)
      .then((routes: Route[]) => {
        this.setState({ userRoutes: routes });
      });
  }

  selectRoute(route: Route) {
    this.setState({ selectedRoute: route });
  }

  deselectRoute = () => {
    this.setState({ selectedRoute: undefined });
  }

  render() {
    if (this.state.selectedRoute) {
      return (
        <div>
          <Map />
          <button onClick={this.deselectRoute}>Back</button>
        </div>
      );
    }

    return (
      <div>
        Hello drive
        <section>
          {
            ...this.state.userRoutes.map((route: Route) => (
              <article key={`route-${route.id}`} onClick={() => { this.selectRoute(route) }}>
                <header>{route.status}</header>
                <section>
                  <ul>
                    {
                      ...route.users.map((user: Worker) => (
                        <li>{new Worker(user).name}</li>
                      ))
                    }
                  </ul>
                </section>
                <footer>{route.date}</footer>
              </article>
            ))
          }
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

export default connect(mapStateToProps, () => ({}))(DriveComponent);

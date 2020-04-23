import React, { Component } from "react";

import axios from "axios";

import { MapComponent as Map, Coordinates } from "../../utils/map";

export class StatisticComponent extends Component<any, any> {
  state = {
    currentPosition: { lng: 24.021847295117936, lat: 49.85496650618947 },
    currentZoom: 15
  }

  componentDidMount() {

  }

  handleMapClick = (e: any) => {
    console.log(e.lngLat.wrap());
  }

  onRoute = (route: Coordinates[]) => {
    console.log(route);
  }

  render() {
    return (
      <div>
        Hello statistics
        <Map
          center={this.state.currentPosition}
          onClick={this.handleMapClick}
          zoom={this.state.currentZoom}
          router={{
            checkpoints: true,
            routes: true,
            onRoute: this.onRoute
          }}
        />
      </div>
    );
  }
}

import React, { Component } from "react";

import axios from "axios";

import { MapComponent as Map, Coordinates } from "../../utils/map";

export class StatisticComponent extends Component<any, any> {
  state = {
    currentPosition: { lng: 24.021847295117936, lat: 49.85496650618947 },
    currentZoom: 15,
    cars: [
      { position: { lng: 24.021847295117936, lat: 49.85496650618947 } },
      { position: { lng: 24.027847295117936, lat: 49.85896650618947 } },
      { position: { lng: 24.015847295117936, lat: 49.86296650618947 } },
      { position: { lng: 24.031847295117936, lat: 49.86696650618947 } },
      { position: { lng: 24.011847295117936, lat: 49.87296650618947 } },
      { position: { lng: 24.001847295117936, lat: 49.87296650618947 } },
      { position: { lng: 24.041847295117936, lat: 49.87296650618947 } }
    ]
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
          cars={this.state.cars}
        />
      </div>
    );
  }
}

import React, { Component } from "react";

import axios from "axios";

import { MapComponent as Map, Coordinates } from "../../utils/map";

export class StatisticComponent extends Component<any, any> {
  state = {
    currentPosition: { lng: 24.021847295117936, lat: 49.85496650618947 },
    currentZoom: 15,
    cars: [
      { position: { lng: 24.021847295117936, lat: 49.85496650618947 } }
    ]
  }

  componentDidMount() {
    // setInterval(() => {
    //   this.setState({
    //     cars: [...this.state.cars, {position: { lng: 24.032478769838917, lat: 49.856060237752814 }}]
    //   });
    // }, 2500)
    setInterval(() => {
      this.setState({
        cars: [
          ...this.state.cars,
          {
            position: {
              lng: this.state.cars[this.state.cars.length - 1].position.lng + 0.005,
              lat: this.state.cars[this.state.cars.length - 1].position.lat + 0.005
            }
          }
        ]
      });
    }, 2500);
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

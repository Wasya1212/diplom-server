import React, { Component } from "react";

import mapboxgl from 'mapbox-gl';

import { Greeter } from "./components/Greeter";

mapboxgl.accessToken = 'pk.eyJ1Ijoid2FzeWExMjEyIiwiYSI6ImNrNXRmdDJwYTB2ajQzZW11N21samJ2cnUifQ.7lV47ah1DXWnbVY7JhGg-g';

interface AppProps {
  lng: number,
  lat: number,
  zoom: number,
  mapContainer: any
};

class App extends Component<AppProps, {}> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      lng: 5,
      lat: 34,
      zoom: 2
    };
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.props.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
  }

  render() {
    return (
      <div>
        <Greeter>Hello World!</Greeter>
        <div>
          <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
        </div>
        <div ref={el => this.mapContainer = el} className="mapContainer" />
      </div>
    );
  }
}

export default App;

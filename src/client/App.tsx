import React, { Component } from "react";

import mapboxgl from 'mapbox-gl';

import { Greeter } from "./components/Greeter";
import { Map } from "./components/Map";

class App extends Component<{}, {}> {
  mapContainer: any;

  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div>
        <Greeter>Hello World!</Greeter>
        <Map />
      </div>
    );
  }
}

export default App;

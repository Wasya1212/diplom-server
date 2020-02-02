import React, { Component } from "react";

import {Map as MapController} from "../../utils/map";

import "./map-style.sass";

class MapComponent extends Component {
  render() {
    return (
      <div id="map-container">
        <MapController lat={49.83498} lng={24.03862} zoom={15} />
      </div>
    )
  }
}

export default MapComponent;

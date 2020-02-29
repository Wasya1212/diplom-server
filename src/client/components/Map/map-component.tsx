import React, { Component } from "react";

import "./map-style.sass";

import "../../assets/models/cybertruck/scene.gltf";
import "../../assets/models/cybertruck/scene.bin";
import "../../assets/models/cybertruck/tesla_ct_export1123.fbx";
import "../../assets/models/cybertruck/car.fbx";
import "../../assets/models/cybertruck/untitled.fbx";
import "../../assets/models/cybertruck/SHC Free Cybertruck.obj";
import "../../assets/models/audi/RS7.obj";

import "../../assets/models/cybertruck/textures/tex1_DSP.png";
import "../../assets/models/cybertruck/textures/tex1.png";
import "../../assets/models/cybertruck/textures/texLOD1.png";
import "../../assets/models/cybertruck/textures/texMain_NRM.png";
import "../../assets/models/cybertruck/textures/texMain_DSP.png";
import "../../assets/models/cybertruck/textures/texMain.png";

import "../../assets/images/map-marker-icon.png";

import { ENVIRONMENT } from "../../environment";

import mapboxgl from "mapbox-gl";
import ReactMapboxGl from "react-mapbox-gl";
import {
  Layer,
  Source,
  Feature,
  ScaleControl,
  MapContext,
  Marker
} from "react-mapbox-gl";

import Checkpoint from "./map-checkpoint-component";
import RoutingForm from "./map-routing-form-component";

import { Object3D as ModelLoader } from "../../utils/Object3D";
import { Object3DLayer } from "../../utils/Object3DMapLayer";

// import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

import MapboxDirections from "../../utils/direction";

import axios from "axios";

// console.log(MapboxDirections)

// let directions = new MapboxDirections({
//   accessToken: ENVIRONMENT.mapbox.accessToken,
//   unit: 'metric',
//   profile: 'mapbox/cycling'
// });

let CarModel = new ModelLoader({
  model: 'models/RS7.obj',
  onLoadProgress: (item: string, loaded: number, total: number) => {
    console.log("load texture:", item, loaded, total);
  },
  setLoadURLModifier: (url: string): string => (`${url}`),
  textures: ['/img/tex1_DSP.png', '/img/tex1.png', '/img/texLOD1.png', '/img/texMain_DSP.png', '/img/texMain.png', '/img/texMain_NRM.png']
});

let car3DModelLayer = new Object3DLayer({
  model: CarModel,
  id: '3d-model',
  type: 'custom',
  coordinates: { lat: 24.03862, lng: 49.83498 }
});

setInterval(() => {
  const { lat, lng } = car3DModelLayer.coordinates;

  car3DModelLayer.setCoordinates({ lat: lat + 0.00001, lng: lng + 0.00001 });
}, 100);

let Map = ReactMapboxGl({
  accessToken: ENVIRONMENT.mapbox.accessToken
});

const BuildingsLayer3DComponent = () => (
  <Layer
    id="3d-buildings"
    minZoom={15}
    sourceLayer="building"
    type="fill-extrusion"
    paint={{
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': [ 'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height'] ],
      'fill-extrusion-base': [ 'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height'] ],
      'fill-extrusion-opacity': 0.6
    }}
    filter={['==', 'extrude', 'true']}
    sourceId="composite"
  />
);

interface MapControllerProps {
  getCoords?: ({lng, lat}: {lng: number, lat: number}) => any,
  onStyleLoad?: (map: any) => void,
  onLoad?: (map: any) => void,
  onMouseMove?: (map: any) => void
}

class MapController extends Component<MapControllerProps> {
  zoomControl = (map: any) => {
    if (map.getZoom() <= 16) {
      map.flyTo({
        pitch: 0,
        bearing: 0
      });
    } else {
      map.flyTo({
        pitch: 65,
        bearing: 20
      });
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <div id="map-container">
        <Map
          style="mapbox://styles/mapbox/streets-v8"
          containerStyle={{
            height: '100%',
            width: '100%'
          }}
          center={[car3DModelLayer.coordinates.lat, car3DModelLayer.coordinates.lng]}
          zoom={[17]}
          pitch={[65]}
          bearing={[20]}
          onZoom={this.zoomControl}
          onStyleLoad={this.props.onStyleLoad}
          onMouseMove={this.props.onMouseMove}
        >
          <div>{this.props.children}</div>
          <MapContext.Consumer>
            {(map: any): any => {
              this.props.onLoad ? this.props.onLoad(map) : null;
            }}
          </MapContext.Consumer>
          <ScaleControl position="top-right"/>
          <BuildingsLayer3DComponent />
        </Map>
      </div>
    );
  }
}

interface Coordinates {
  lng: number,
  lat: number
}

interface MapComponentState {
  currentCoordinates?: Coordinates,
  checkedCoordinates: Coordinates,
  waypoints: Coordinates[]
}

class MapComponent extends Component<{}, MapComponentState> {
  state = {
    checkedCoordinates: { lng: 0, lat: 0 },
    waypoints: [{lat: 24.03862, lng: 49.83498}]
  }

  getCoords = (coords: {lat: number, lng: number}) => {
    console.log("hui")
    this.setState({ checkedCoordinates: coords });
  }

  addWaypoint = () => {
    if (this.state.checkedCoordinates.lng == 0 && this.state.checkedCoordinates.lat == 0) {
      alert("Enter norm coordinates!");
    } else {
      this.setState({
        waypoints: this.state.waypoints.concat(this.state.checkedCoordinates)
      });
    }
  }

  add3DObject(object: Object3DLayer, map: any) {
    map.addLayer(object, "waterway-label");
  }

  getRoute() {
    axios
      .get(`https://api.mapbox.com/directions/v5/mapbox/driving/-122.42,37.78;-77.03,38.91?access_token=${ENVIRONMENT.mapbox.accessToken}`)
      .then(({data}) => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      })
  }

  declareIcon(opts: { path: string, title: string}, map: any) {
    map.loadImage(opts.path, (err, image) => {
      if (err) {
        console.error(err);
      } else {

      }
      map.addImage(opts.title, image);
    });
  }

  handleMapClick(map: any) {
    map.on('mousedown', (e: any) => {
      try {
        this.setState({ checkedCoordinates: e.lngLat.wrap() });
      } catch (err) {
        console.error(err);
      }
    });
  }

  componentDidUpdate() {
    console.log(this.state.waypoints);
  }

  handleMapLoad = (map: any) => {
    this.declareIcon({path: '/img/map-marker-icon.png', title: 'map-marker-icon'}, map);
    this.handleMapClick(map);
  }

  handleMapStyleClick = (map: any) => {
    this.add3DObject(car3DModelLayer, map);
  }

  render() {
    return(
      <div>
        <MapController onStyleLoad={this.handleMapStyleClick} onLoad={this.handleMapLoad} getCoords={this.getCoords}>
          <Checkpoint textColor="#ffffff" icon="map-marker-icon" iconScale={0.15} points={this.state.waypoints} />
        </MapController>
        <RoutingForm handleClick={this.addWaypoint} lat={this.state.checkedCoordinates.lat} lng={this.state.checkedCoordinates.lng} />
      </div>
    );
  }
}

export default MapComponent;

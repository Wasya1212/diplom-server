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
import "../../assets/images/map-current-marker-icon.png";

import { ENVIRONMENT } from "../../environment";
import { ICONS } from "../../data";

import {
  calculateDistance,
  parseToCoordsObject,
  calculateAngle
} from "../../utils/mapCalc";

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
import { WaypointController } from "../../utils/waypointMapController";
import { Object3DMapController } from "../../utils/object3DMapController";

import MapboxDirections from "../../utils/direction";

var promiseWaterfall = require('promise.waterfall');

import axios from "axios";

// console.log(calculateDistance({ lat: 77.1539, lng: -139.398}, { lat: -77.1804, lng: -139.55}));

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
  coordinates: { lat: 24.03862, lng: 49.83498 },
  scale: 0.2
});

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
  onMouseMove?: (map: any) => void,
  waypoints?: Coordinates[],
  onZoom?: (map: any) => void
}

class MapController extends Component<MapControllerProps> {
  shouldComponentUpdate() {
    return false;
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
          bearing={[0]}
          onZoom={this.props.onZoom}
          onStyleLoad={this.props.onStyleLoad}
          onMouseMove={this.props.onMouseMove}
        >
          <MapContext.Consumer>
            {(map: any): any => {
              this.props.onLoad ? this.props.onLoad(map) : null;
            }}
          </MapContext.Consumer>
          <ScaleControl position="top-right"/>
          <BuildingsLayer3DComponent />
          <div>{this.props.children}</div>
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
  waypoints: Coordinates[],
  map?: any
}

class MapComponent extends Component<{}, MapComponentState> {
  private _waypointController: WaypointController | any = {};
  private timer: any;
  private _car3DModelController: Object3DMapController | any = {};
  private _map: any;

  constructor(props) {
    super(props);

    this.state = {
      checkedCoordinates: { lng: 0, lat: 0 },
      waypoints: []
    }
  }

  handleMapZoom = (map: any) => {
    if (map.getZoom() <= 16) {
      map.flyTo({
        pitch: 0,
        bearing: 0
      });
    } else {
      map.flyTo({
        pitch: 65,
        bearing: 0
      });
    }

    console.log("zoom", map.getZoom())

    if (map.getZoom() >= 16) {
      this._map.setLayoutProperty('3d-buildings', 'visibility', 'visible');
      try {
        this._car3DModelController.object.scale = 0.2;
      } catch(err) { console.error(err); }
    } else if (map.getZoom() >= 13.5) {
      this._map.setLayoutProperty('3d-buildings', 'visibility', 'none');
      try {
        this._car3DModelController.object.scale = 2.2;
      } catch(err) { console.error(err); }
    } else if (map.getZoom() >= 12.2) {
      try {
        this._car3DModelController.object.scale = 10;
      } catch(err) { console.error(err); }
    }
  }

  getCoords = (coords: {lat: number, lng: number}) => {
    this.setState({ checkedCoordinates: coords });
  }

  addWaypoint = () => {
    if (this.state.checkedCoordinates.lng == 0 && this.state.checkedCoordinates.lat == 0) {
      alert("Enter norm coordinates!");
    } else {
      if (this.state.waypoints.length > 0) {
        this.setState({
          waypoints: this.state.waypoints.concat(this.state.checkedCoordinates)
        });
      } else {
        this.setState({ waypoints: [this.state.checkedCoordinates] });
      }
    }
  }

  add3DObject(object: Object3DLayer, map: any) {
    try {
      map.addLayer(object, "waterway-label");
    } catch (err) {
      console.error(err);
    }
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

  handleMapClick(map: any) {
    map.on('click', (e: any) => {
      try {
        const currentCheckedCoordinates = e.lngLat.wrap();

        WaypointController.addIcon(
          map,
          {
            name: ICONS[1].title,
            scale: 0.17
          },
          'current-marker',
          currentCheckedCoordinates
        );

        this.setState({ checkedCoordinates: currentCheckedCoordinates });
      } catch (err) {
        console.error(err);
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.waypoints !== nextState.waypoints) {
      this._waypointController.waypoints = nextState.waypoints;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(this.state.waypoints);

    if (prevState.waypoints != this.state.waypoints) {
      if (this.timer) {
        clearInterval(this.timer);
      }

      this._waypointController
        .getRoute()
        .then(route => {
          this._waypointController.map.moveLayer(this._waypointController.layerId);
          // console.log(calculateDistance(
          //   parseToCoordsObject(route[0]),
          //   parseToCoordsObject(route[1])
          // ));
          //
          // let rotationAngle = calculateAngle(
          //   parseToCoordsObject(route[0]),
          //   parseToCoordsObject(route[1])
          // );
          //
          //
          //
          // console.log("rotation angle:", rotationAngle);
          //
          // rotationAngle = rotationAngle > 30 ? rotationAngle - 15 : rotationAngle;
          //
          // this._car3DModelController.setRotation(-rotationAngle - 15);
          // this._car3DModelController.setRotation(-rotationAngle);

          // let i = 0;
          //
          // let t = setInterval(() => {
          //   // this._car3DModelController.setRotation(-50 - i);
          //   i++;
          //   // if ((i + 50) == rotationAngle) {
          //   //   clearInterval(t);
          //   // }
          //   console.log("i", -(i + 50));
          //   console.log("angle", -rotationAngle);
          // }, 100);

          return route;
        })
        .then((route) => {
          let driveImitation: any = [];

          route.forEach((point: number[], index: number) => {
            if (index + 1 == route.length) {
              return;
            }

            let currentPoint = parseToCoordsObject(point);
            let nextPoint = parseToCoordsObject(route[index + 1]);

            let routeDistance = calculateDistance(currentPoint, nextPoint);
            let routeRotationAngle = calculateAngle(currentPoint, nextPoint);
            routeRotationAngle = routeRotationAngle > 30 ? routeRotationAngle - 15 : routeRotationAngle;

            driveImitation.push({
              from: currentPoint,
              to: nextPoint,
              distance: routeDistance,
              angle: routeRotationAngle
            });
          });

          return { route, driveImitation };
        })
        .then(({driveImitation}) => {
          promiseWaterfall(
            driveImitation.map((route, index) => (() => {
              this._car3DModelController.setRotation(-driveImitation[index].angle);
              return this._car3DModelController.move(driveImitation[index].from, driveImitation[index].to);
            }))
          )

          // const fullRoute = route.map((coord: number[]) => ({ lat: coord[0], lng: coord[1] }));

          // this._car3DModelController.move(fullRoute[0], fullRoute[1]);

          // console.log(Object3DMapController.getAngle(fullRoute[0], fullRoute[1]));

          // let index = 0;

          // const fullRoute = route.map(coord => ({ lat: coord[0], lng: coord[1] }));
          //
          // this.timer = setInterval(() => {
          //   car3DModelLayer.setCoordinates(fullRoute[index]);
          //   fullRoute.length > index + 1 ? index++ : index = 0;
          // }, 100);
          // console.log("route:", route);
        })
        .then(() => {
          this.add3DObject(car3DModelLayer, this._map);
          this._map.moveLayer("3d-model");
        });
    }
  }


  handleMapLoad = (map: any) => {
    this._map = map;

    this._waypointController = new WaypointController({
      map: map,
      icons: ICONS,
      waypointIconStyle: {
        name: ICONS[0].title,
        scale: 0.17,
        text: {
          color: '#ffffff',
          size: 40
        }
      }
    });

    this._car3DModelController = new Object3DMapController(map, car3DModelLayer);

    this.handleMapClick(map);
    this.setState({map});
  }

  handleMapStyleClick = (map: any) => {
    try {
      // this.add3DObject(car3DModelLayer, map);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return(
      <div>
        <MapController onZoom={this.handleMapZoom} waypoints={this.state.waypoints} onStyleLoad={this.handleMapStyleClick} onLoad={this.handleMapLoad} getCoords={this.getCoords}>
        </MapController>
        <RoutingForm handleClick={this.addWaypoint} lat={this.state.checkedCoordinates.lat} lng={this.state.checkedCoordinates.lng} />
      </div>
    );
  }
}

export default MapComponent;

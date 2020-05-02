import React, { Component } from "react";

import "../assets/models/audi/RS7.obj";
import "../assets/images/map-marker-icon.png";
import "../assets/images/map-current-marker-icon.png";

import ReactMapboxGl from "react-mapbox-gl";
import mapboxgl from "mapbox-gl";

import {
  Layer,
  Source,
  Feature,
  ScaleControl,
  MapContext,
  Marker
} from "react-mapbox-gl";

import { ENVIRONMENT } from "../environment";
import { ICONS } from "../data";

import { WaypointController } from "./waypointMapController";

import { Object3D as ModelLoader } from "./Object3D";
import { Object3DLayer } from "./Object3DMapLayer";
import { Object3DMapController } from "./object3DMapController";

mapboxgl.accessToken = ENVIRONMENT.mapbox.accessToken;

let map: mapboxgl.Map;

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

interface RoutingFormState {
  lat: number,
  lng: number
}

interface RoutingFormProps {
  lat: number,
  lng: number,
  handleClick?: () => void
}

export class RoutingForm extends Component<RoutingFormProps, RoutingFormState> {
  state = {
    lng: this.props.lng,
    lat: this.props.lat
  }

  setCoords = (coords: {lng: number, lat: number}) => {
    this.setState({lng: coords.lng, lat: coords.lat});
  }

  setLat = (e) => {
    this.setState({lat: e.value});
  }

  setLng = (e) => {
    this.setState({lat: e.value});
  }

  render() {
    return (
      <div className="map-router-form">
        <form className="route-form">
          <input onChange={this.setLat} type="text" value={this.props.lat || ""} placeholder="Latitude..."/>
          <input onChange={this.setLng} type="text" value={this.props.lng || ""} placeholder="Longitude..."/>
        </form>
        {this.props.children}
      </div>
    );
  }
}

export interface Coordinates {
  lat: number,
  lng: number
}

interface MapControllerProps {
  onClick?: (map: any) => void,
  getCoords?: ({lng, lat}: {lng: number, lat: number}) => any,
  onStyleLoad?: (map: any) => void,
  onLoad?: (map: any) => void,
  onMouseMove?: (map: any) => void,
  waypoints?: Coordinates[],
  onZoom?: (map: any) => void,
  center?: Coordinates,
  zoom?: number,
  pitch?: number,
  bearing?: number
}

class MapController extends Component<MapControllerProps, any> {
  shouldComponentUpdate() {
    return false;
  }

  onLoad = (map: any) => {
    if (this.props.onStyleLoad) { this.props.onStyleLoad(map); }

    map.on('click', (e: any) => {
      try {
        if (this.props.onClick) this.props.onClick(e);
      } catch (err) {
        console.error(err);
      }
    });
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
          center={this.props.center ? [this.props.center.lng, this.props.center.lat] : [0, 0]}
          zoom={[this.props.zoom || 0]}
          pitch={[this.props.pitch || 0]}
          bearing={[this.props.bearing || 0]}
          onZoom={this.props.onZoom}
          onStyleLoad={this.onLoad}
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

export interface MapProps {
  onClick?: (map: any) => void,
  onLoad?: (map: any) => void,
  onZoom?: (map: any) => void,
  center?: Coordinates,
  zoom?: number,
  pitch?: number,
  bearing?: number,
  router?: MapPropsRoute,
  checkpoints?: boolean,
  markers?: Coordinates[],
  cars?: MapPropsCars[]
}

export interface MapPropsRoute {
  checkpoints?: boolean,
  routes?: boolean,
  onRoute?: (route: Coordinates[]) => void
}

export interface MapPropsCars {
  position: Coordinates,
  rotation?: number,
  size?: number
}

export interface MapState {
  _map?: any,
  checkedCoordinates?: Coordinates,
  checkpoints?: Coordinates[],
  cars?: Object3DMapController[]
}

export class MapComponent extends Component<MapProps, MapState> {
  private _waypointController: WaypointController | any = {};
  private _carModel: ModelLoader;

  constructor(props) {
    super(props);

    this._carModel = new ModelLoader({
      model: 'models/RS7.obj',
      onLoadProgress: (item: string, loaded: number, total: number) => {
        console.log("load texture:", item, loaded, total);
      },
      setLoadURLModifier: (url: string): string => (`${url}`),
      textures: ['/img/tex1_DSP.png', '/img/tex1.png', '/img/texLOD1.png', '/img/texMain_DSP.png', '/img/texMain.png', '/img/texMain_NRM.png']
    });

    this.state = {
      _map: undefined,
      checkedCoordinates: { lat: 0, lng: 0 },
      checkpoints: []
    }
  }

  private changeCarCoordinates(car: Object3DMapController, newCoordinates: Coordinates) {
    try {
      car.object.setCoordinates(newCoordinates);
    } catch (err) {
      console.error(err);
    }
  }

  private changeCarRotation(car: Object3DMapController, rotation: number) {
    try {
      car.object.setRotation(rotation);
    } catch (err) {
      console.error(err);
    }
  }

  private changeCarSize(car: Object3DMapController, size: number) {
    try {
      car.object.setScale(size);
    } catch (err) {
      console.error(err);
    }
  }

  private createCarLayer(car: MapPropsCars, id: string): Object3DLayer {
    return new Object3DLayer({
      model: this._carModel,
      id: id,
      type: 'custom',
      coordinates: car.position,
      scale: 0.2
    })
  }

  private createCarController(layer: Object3DLayer) {
    return new Object3DMapController(this.state._map, layer)
  }

  private addCarLayerToMap(layer: Object3DLayer) {
    try {
      this.state._map.addLayer(layer, "waterway-label");
    } catch (err) {
      console.error(err);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.markers && this._waypointController) {
      // this._waypointController.waypoints = [...(this._waypointController.waypoints || []), ...(nextProps.markers || [])];
      // console.log("WAYPOINTS2:", nextProps.markers);
      this._waypointController.waypoints = [...(nextProps.markers || [])]
    }

    const oldPropsCars: MapPropsCars[] = (this.props.cars || []);
    const newPropsCars: MapPropsCars[] = (nextProps.cars || []);
    const currentStateCars: Object3DMapController[] = (this.state.cars || []);

    if (currentStateCars.length < newPropsCars.length) {
      currentStateCars.forEach((car: Object3DMapController, index: number) => {
        if (currentStateCars[index].object.coordinates != newPropsCars[index].position) {
          this.changeCarCoordinates(currentStateCars[index], newPropsCars[index].position);
          this.changeCarRotation(currentStateCars[index], newPropsCars[index].rotation || 0);
          this.changeCarSize(currentStateCars[index], newPropsCars[index].size || 0.2);
        }
      });

      let newCarLayers: Object3DLayer[] = [];
      let newCarControllers: Object3DMapController[] = [];

      for (let i = currentStateCars.length; i <  newPropsCars.length; i++) {
        newCarLayers.push(this.createCarLayer(newPropsCars[i], `3d-model-${i + 1}`));
        newCarControllers.push(this.createCarController(newCarLayers[newCarLayers.length - 1]));
      }

      newCarLayers.forEach(layer => {
        this.addCarLayerToMap(layer);
      });

      this.setState({
        cars: [...currentStateCars, ...newCarControllers]
      });
    }
    if (currentStateCars.length > newPropsCars.length) {
      newPropsCars.forEach((car: MapPropsCars, index: number) => {
        if (currentStateCars[index].object.coordinates != newPropsCars[index].position) {
          this.changeCarCoordinates(currentStateCars[index], newPropsCars[index].position);
          this.changeCarRotation(currentStateCars[index], newPropsCars[index].rotation || 0);
          this.changeCarSize(currentStateCars[index], newPropsCars[index].size || 0.2);
        }
      });

      for (let i = newPropsCars.length; i <  currentStateCars.length; i++) {
        try {
          this.state._map.removeLayer(`3d-model-${i + 1}`);
        } catch (err) {
          console.error(err);
        }

        delete currentStateCars[i];
      }

      this.setState({ cars: currentStateCars.splice(0, newPropsCars.length) });
    }
    if (currentStateCars.length == newPropsCars.length) {
      currentStateCars.forEach((car: Object3DMapController, index: number) => {
        if (currentStateCars[index].object.coordinates != newPropsCars[index].position) {
          this.changeCarCoordinates(currentStateCars[index], newPropsCars[index].position);
          this.changeCarRotation(currentStateCars[index], newPropsCars[index].rotation || 0);
          this.changeCarSize(currentStateCars[index], newPropsCars[index].size || 0.2);
        }
      });
    }

    currentStateCars.forEach((car, index) => {
      this.state._map.moveLayer(`3d-model-${index + 1}`);
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state._map != undefined && this.state._map != prevState._map) {
      if (this.props.cars) {
        let carLayers: Object3DLayer[] = this.props.cars.map((car: MapPropsCars, index: number) => {
          return this.createCarLayer(car, `3d-model-${index + 1}`)
        });

        let carControllers: Object3DMapController[] = carLayers.map((layer: Object3DLayer) => this.createCarController(layer));

        this.setState({ cars: carControllers });

        carLayers.forEach((layer: Object3DLayer) => {
          this.addCarLayerToMap(layer);
        });
      }
    }

    if (
      this.props.center && (
        this.props.center != prevProps.center
        || this.props.zoom != prevProps.zoom
        || this.props.bearing != prevProps.bearing
        || this.props.pitch != prevProps.pitch
      )
    ) {
      if (!this.state._map) return;
      this.state._map.flyTo({
        center: [this.props.center.lng, this.props.center.lat],
        zoom: [this.props.zoom],
        bearing: [this.props.bearing],
        pitch: [this.props.pitch]
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.checkpoints !== nextState.checkpoints) {
      this._waypointController.waypoints = [...nextState.checkpoints, ...(nextProps.markers || [])];
    }
  }

  onLoad = (map: any) => {
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

    this.setState({ _map: map });

    if (this.props.markers) {
      console.log(this.props.markers)
      this._waypointController.waypoints = [...(this.props.markers || [])];
    }

    if (this.props.onLoad) this.props.onLoad(map);
  }

  onClick = (e: any) => {
    if (this.props.router) {
      this.setState({ checkedCoordinates: e.lngLat.wrap() });

      WaypointController.addIcon(
        this.state._map,
        {
          name: ICONS[1].title,
          scale: 0.17
        },
        'current-marker',
        e.lngLat.wrap()
      );
    }
    if (this.props.onClick) { this.props.onClick(e); }
  }

  addCheckpoint = () => {
    if (!this.state.checkedCoordinates || this.state.checkedCoordinates.lat == 0 && this.state.checkedCoordinates.lng == 0) {
      alert("Enter checkpoint");
      return;
    }

    if (this.state.checkpoints && this.state.checkpoints.length > 0) {
      this.setState({
        checkpoints: [...this.state.checkpoints, this.state.checkedCoordinates],
        checkedCoordinates: { lng: 0, lat: 0}
      });
    } else {
      this.setState({
        checkpoints: [this.state.checkedCoordinates],
        checkedCoordinates: { lng: 0, lat: 0}
      });
    }
  }

  addCar = (car: Object3DLayer) => {
    try {
      // this.state.cars.object.setCoordinates(this.props.center || {lat: 0, lng: 0});
      this.state._map.addLayer(car, "waterway-label");
      // this.state.cars.object.setScale(20);
      // this.state.cars.object.id = "3dcar2"
      // this.state._map.addLayer(this._carLayer, "waterway-label");

    } catch (err) {
      console.error(err);
    }
  }

  buildRoute = async () => {
    if (this.state.checkpoints && this.state.checkpoints.length <= 1) {
      return;
    }

    const route: Coordinates[] = await this._waypointController.getRoute();

    if (this.props.router && this.props.router.onRoute) {
      try {
        this.props.router.onRoute(route);
      } catch (err) {
        console.error(err);
      }
    }

    this._waypointController.map.moveLayer(this._waypointController.layerId);
  }

  render() {
    return (
      <div id="map-container">
        <MapController {...this.props} onZoom={this.props.onZoom} onClick={this.onClick} onLoad={this.onLoad}>{this.props.children}</MapController>
        {
          this.props.router
            ? <RoutingForm
                lat={this.state.checkedCoordinates ? this.state.checkedCoordinates.lat : 0}
                lng={this.state.checkedCoordinates ? this.state.checkedCoordinates.lng : 0}
              >
                {
                  this.props.router.checkpoints ? <button onClick={this.addCheckpoint}>Add checkpoint</button> : null
                }
                {
                  this.props.router.routes && this.props.router.checkpoints ? <button onClick={this.buildRoute}>Build Route</button> : null
                }
              </RoutingForm>
            : null
        }


      </div>
    );
  }
}

import React, { Component } from "react";

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

import { ENVIRONMENT } from "../environment";
import { ICONS } from "../data";

import { WaypointController } from "./waypointMapController";

mapboxgl.accessToken = ENVIRONMENT.mapbox.accessToken;

let map: mapboxgl.Map;

let Map = ReactMapboxGl({
  accessToken: ENVIRONMENT.mapbox.accessToken
});

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
      <form className="route-form">
        <input onChange={this.setLat} type="text" value={this.props.lat || ""} placeholder="Latitude..."/>
        <input onChange={this.setLng} type="text" value={this.props.lng || ""} placeholder="Longitude..."/>
      </form>
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
          <div>{this.props.children}</div>
        </Map>
      </div>
    );
  }
}

export interface MapProps {
  onClick?: (map: any) => void,
  onLoad?: (map: any) => void,
  center?: Coordinates,
  zoom?: number,
  pitch?: number,
  bearing?: number,
  router?: any,
  checkpoints?: boolean
}

export interface MapState {
  _map?: any,
  checkedCoordinates?: Coordinates,
  checkpoints?: Coordinates[]
}

export class MapComponent extends Component<MapProps, MapState> {
  private _waypointController: WaypointController | any = {};

  state = {
    _map: undefined,
    checkedCoordinates: { lat: 0, lng: 0 },
    checkpoints: []
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.center && (
        this.props.center != prevProps.center
        || this.props.zoom != prevProps.zoom
        || this.props.bearing != prevProps.bearing
        || this.props.pitch != prevProps.pitch
      )
    ) {
      if (!this.state._map) return;
      //@ts-ignore
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
      this._waypointController.waypoints = nextState.checkpoints;
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
    if (this.state.checkpoints.length > 0) {
      this.setState({
        checkpoints: [...this.state.checkpoints, this.state.checkedCoordinates]
      });
    } else {
      this.setState({ checkpoints: [this.state.checkedCoordinates] });
    }
  }

  buildRoute = () => {
    this._waypointController
      .getRoute()
      .then(route => {
        this._waypointController.map.moveLayer(this._waypointController.layerId);
      });
  }

  render() {
    return (
      <div id="map-container">
        <MapController {...this.props} onClick={this.onClick} onLoad={this.onLoad}>{this.props.children}</MapController>
        {
          this.props.router
            ? <RoutingForm
                lat={this.state.checkedCoordinates ? this.state.checkedCoordinates.lat : 0}
                lng={this.state.checkedCoordinates ? this.state.checkedCoordinates.lng : 0}
              />
            : null
        }
        {
          this.props.checkpoints ? <button onClick={this.addCheckpoint}>Add checkpoint</button> : null
        }
        <button onClick={this.buildRoute}>Build Route</button>
      </div>
    );
  }
}

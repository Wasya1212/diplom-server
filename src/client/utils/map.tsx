import React, { Component } from "react";

import mapboxgl from "mapbox-gl";

import { ENVIRONMENT } from "../environment";

mapboxgl.accessToken = ENVIRONMENT.mapbox.accessToken;

export interface MapState {
  lng: number,
  lat: number,
  zoom: number
};

export interface MapProps {
  lng?: number,
  lat?: number,
  zoom?: number,
  onCoordsChange?: (props: {lng?: number, lat?: number}) => {},
  mapStyle?: string
};

export class Map extends Component<MapProps, MapState> {
  protected mapContainer: any;

  constructor(props: MapProps) {
    super(props);

    this.state = {
      lng: this.props.lng || 5,
      lat: this.props.lat || 34,
      zoom: this.props.zoom || 2
    };

    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: this.props.mapStyle || 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    map.on('move', () => {
      const lng = parseInt(map.getCenter().lng.toFixed(4));
      const lat = parseInt(map.getCenter().lat.toFixed(4));
      const zoom = parseInt(map.getZoom().toFixed(2));

      this.setState({lng, lat, zoom});

      if (this.props.onCoordsChange) {
        try {
          this.props.onCoordsChange({lng, lat})
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  render() {
    return (
      <div ref={el => this.mapContainer = el} className="mapContainer" />
    );
  }
}

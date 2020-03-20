import { Icon } from "../data";
import { ENVIRONMENT } from "../environment";

import axios from "axios";
const polyline = require('@mapbox/polyline');

export interface Waypoint {
  lat: number,
  lng: number
}

export interface WaypointControllerOptions {
  map: any,
  icons?: Icon[],
  waypoints?: Waypoint[],
  waypointIconStyle?: IconProperties
}

export interface IconTextProperties {
  color?: string,
  size?: number,
  lineHeight?: number,
  translate?: number[],
  offset?: number[]
}

export interface IconProperties {
  scale?: number,
  text?: IconTextProperties,
  name: string,
  offset?: { x: number, y: number }
}

export class WaypointController {
  private _map: any;

  private _waypointIconStyle: IconProperties;

  private _icons: Icon[];
  private _waypoints: Waypoint[];

  constructor(opts: WaypointControllerOptions) {
    this._map = opts.map;
    this._icons = opts.icons || [];
    this._waypoints = opts.waypoints || [];

    if (opts.waypointIconStyle) {
      this._waypointIconStyle = opts.waypointIconStyle;
    } else if (opts.icons) {
      this._waypointIconStyle = { name: this._icons[0].title };
    } else {
      this._waypointIconStyle = { name: 'marker-15' };
    }

    this.init();
  }

  private init() {
    if (this._icons.length > 0) {
      this._icons.forEach((icon: Icon) => {
        WaypointController.declareIcon(this._map, icon);
      });
    }

    this.addSourceLayer();
  }

  get map() {
    return this._map;
  }

  public static declareIcon(map: any, icon: Icon) {
    try {
      map.loadImage(`${icon.path}.${icon.ext}`, (err: any, image: any) => {
        if (err) {
          console.error(err);
        } else {
          map.addImage(icon.title, image);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  public static addIcon(map: any, iconProps: IconProperties, id: string, coordinates: Waypoint | Waypoint[]) {
    if (map.getLayer('layer-' + id) !== undefined) {
      map.removeLayer('layer-' + id);
    }
    if (map.getSource('source-' + id) !== undefined) {
      map.removeSource('source-' +id);
    }

    let coordinatesList: Waypoint[] = Array.isArray(coordinates) ? coordinates : [coordinates];

    map.addSource('source-' + id, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: coordinatesList.map((waypoint: Waypoint, index: number) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [waypoint.lng, waypoint.lat]
          },
          properties: {
            icon: iconProps.name,
            title: iconProps.text ? `${index + 1}` : ''
          }
        }))
      }
    });

    map.addLayer({
      paint: {
        'text-color': iconProps.text ? iconProps.text.color || '#000000' : '#000000',
        'text-translate': iconProps.text ? iconProps.text.translate || [0, 0] : [0, 0]
      },
      id: 'layer-' + id,
      type: 'symbol',
      source: 'source-' + id,
      layout: {
        'icon-anchor': 'bottom',
        'text-line-height': iconProps.text ? iconProps.text.lineHeight || 1.2 : 1.2,
        'icon-offset': iconProps.offset ? [iconProps.offset.x, iconProps.offset.y] : [0, 0],
        'icon-size': iconProps.scale || 1,
        'text-field': ['get', 'title'],
        'text-size': iconProps.text ? iconProps.text.size || 40 : 40,
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': iconProps.text ? iconProps.text.offset || [0, -1.2] : [0, -1.2],
        'icon-ignore-placement': true,
        'icon-image': ['concat', ['get', 'icon'], ''],
        'text-allow-overlap': true,
        'symbol-placement': 'point'
      }
    });
  }

  set waypoints(waypoints: Waypoint[]) {
    this._waypoints = waypoints;

    WaypointController.addIcon(this._map, this._waypointIconStyle, 'checkpoint', this._waypoints);
  }

  public addMarker(id: string, iconProps: IconProperties, coordinates: Waypoint) {
    WaypointController.addIcon(this._map, iconProps, id, coordinates);
  }

  public addMarkers(id: string, iconProps: IconProperties, coordinates: Waypoint[]) {
    WaypointController.addIcon(this._map, iconProps, id, coordinates);
  }

  private addSourceLayer() {
    WaypointController.addIcon(this._map, { name: this._waypointIconStyle.name }, 'checkpoint', this._waypoints);
  }

  public async getRoute() {
    if (this._waypoints.length < 2) {
      return;
    }

    if (this._waypoints.length > 12) {
      alert("Maximum waypoints!");
      return;
    }

    let routeData = await axios.get(`https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${this._waypoints.map((waypoint: Waypoint) => (`${waypoint.lng},${waypoint.lat}`)).join(';')}?access_token=${ENVIRONMENT.mapbox.accessToken}`).then(({data}) => data);
    let routeWay = polyline.decode(routeData.trips[0].geometry.toString()).map(el => ([el[1], el[0]]));

    if (this._map.getLayer('layer-route') !== undefined) {
      this._map.removeLayer('layer-route');
    }
    if (this._map.getSource('source-route') !== undefined) {
      this._map.removeSource('source-route');
    }

    this._map.addSource('source-route', {
      type: 'geojson',
      lineMetrics: true,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: routeWay,
              type: 'LineString'
            }
          }
        ]
      }
    });

    this._map.addLayer({
      type: 'line',
      source: 'source-route',
      id: 'layer-route',
      paint: {
        'line-color': 'red',
        'line-width': 14,
        // 'line-gradient' must be specified using an expression
        // with the special 'line-progress' property
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, 'yellow',
          1, 'red'
        ]
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      }
    });

    return routeWay;
  }
}
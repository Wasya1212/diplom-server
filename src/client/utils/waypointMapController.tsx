import { Icon } from "../data";

export interface Waypoint {
  lat: number,
  lng: number
}

export interface WaypointControllerOptions {
  map: any,
  icons?: Icon[],
  waypoints?: Waypoint[]
}

export class WaypointController {
  private _map: any;

  private _icons: Icon[];
  private _waypoints: Waypoint[];

  constructor(opts: WaypointControllerOptions) {
    this._map = opts.map;
    this._icons = opts.icons || [];
    this._waypoints = opts.waypoints || [];

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

  set waypoints(waypoints: Waypoint[]) {
    this._waypoints = waypoints;

    this.addSourceLayer();
  }

  private addSourceLayer() {
    if (this._map.getLayer('points') !== undefined) {
      this._map.removeLayer('points');
    }
    if (this._map.getSource('point') !== undefined) {
      this._map.removeSource('point');
    }

    this._map.addSource('point', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': this._waypoints.map((waypoint: Waypoint) => ({
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [waypoint.lng, waypoint.lat]
          }
        }))
      }
    });

    this._map.addLayer({
      'id': 'points',
      'type': 'symbol',
      'source': 'point',
      'layout': {
      'icon-image': 'map-marker-icon',
      'icon-size': 0.25
      }
    });
  }
}

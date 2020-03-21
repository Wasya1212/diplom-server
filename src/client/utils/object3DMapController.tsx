import { Object3DLayer as Object3D } from "./Object3DMapLayer";
import { Object3DCoordinates } from "./object3DMapComponent";
import {
  calculateDistance,
  parseToCoordsObject
} from "./mapCalc";

export const DEFAULT_SPEED = 6.0;
export const DEFAULT_METERS_SPLITTER = 2; // meters

export class Object3DMapController {
  private _map: any;
  private _object3D: Object3D;

  private _timer?: NodeJS.Timeout;

  public moveSpeed?: number;

  constructor(map: any, object3D: Object3D) {
    this._map = map;
    this._object3D = object3D;
  }

  get object(): Object3D {
    return this._object3D;
  }

  public move(from: Object3DCoordinates, to: Object3DCoordinates, speed: number = DEFAULT_SPEED) {
    return new Promise((resolve, reject) => {
      if (this._timer) {
        clearInterval(this._timer);
      }

      const points: Object3DCoordinates[] = Object3DMapController.breakRouteToPoints(from, to);

      let pointIndex = 0;

      this._timer = setInterval(() => {
        ++pointIndex;

        if (pointIndex + 1 == points.length && this._timer) {
          clearInterval(this._timer);
          resolve(true);
        }

        this._object3D.setCoordinates(points[pointIndex]);
      }, 100);
    });
  }

  public async stopMove() {
    if (this._timer) {
      clearInterval(this._timer);
    }
  }

  public setRotation(rotate: number) {
    this._object3D.setRotation(rotate);
  }

  public static breakRouteToPoints(start: Object3DCoordinates, end: Object3DCoordinates): Object3DCoordinates[] {
    const distance: number = calculateDistance(start, end);
    const pointsCount: number = distance / (DEFAULT_METERS_SPLITTER / 3);

    console.log("pointsCount:", pointsCount)

    const routeSequence: Object3DCoordinates = { lat: end.lat - start.lat, lng: end.lng - start.lng };
    const pointLength: Object3DCoordinates = { lat: routeSequence.lat / pointsCount, lng: routeSequence.lng / pointsCount };

    let points: Object3DCoordinates[] = [ start ];

    for (let i = 1; i < pointsCount - 1; i++) {
      points.push({
        lat: start.lat + (pointLength.lat * i),
        lng: start.lng + (pointLength.lng * i)
      });
    }

    points.push(end);

    // b = arctg( (cos(fi2) * sin(l2 - l1)) / (cos(fi1) * sin(fi2) - cos(fi2) * sin(fi1) * cos(l2 - l1))
    // где b - направление ортодромии или путевой угол,
    // fi1 - широта аэропорта откуда летим,
    // l1 - долгота аэропорта откуда летим,
    // fi2 и l2 - куда летим.

    return points;
  }
}

import { Object3DLayer as Object3D } from "./Object3DMapLayer";
import { Object3DCoordinates } from "./object3DMapComponent";
import { calculateDistance } from "./mapCalc";

export const DEFAULT_SPEED = 6.0;

export class Object3DMapController {
  private _map: any;
  private _object3D: Object3D;

  private _timer: any;

  public moveSpeed?: number;

  constructor(map: any, object3D: Object3D) {
    this._map = map;
    this._object3D = object3D;
  }

  get object(): Object3D {
    return this._object3D;
  }

  public move(from: Object3DCoordinates, to: Object3DCoordinates, speed: number = DEFAULT_SPEED) {
    const points: Object3DCoordinates[] = Object3DMapController.breakRouteToPoints(from, to);



  }

  public static breakRouteToPoints(start: Object3DCoordinates, end: Object3DCoordinates): Object3DCoordinates[] | void {
    const distance = calculateDistance(start, end);
  }
}

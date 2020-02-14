import { MercatorCoordinate } from "mapbox-gl";

import THREE, {
  DirectionalLight,
  WebGLRenderer,
  Camera,
  Scene,
  Matrix4,
  Vector3
} from "three";

export interface Object3DMapComponentOptions {
  lights?: Light | Light[],
  renderingContext: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  alpha?: boolean,
  antialias?: boolean,
  coordinates: Object3DCoordinates,
  rotation?: Object3DRotate
}

export interface Light {
  position: Object3DPosition,
  color: string | THREE.Color | number
}

export interface Object3DPosition {
  x: number,
  y: number,
  z: number
}

export interface Object3DCoordinates {
  lat: number,
  lng: number
}

export interface Object3DRotate {
  x: number,
  y: number,
  z: number
}

export interface Object3DTransformModel {
  translateX: number,
  translateY: number,
  translateZ: number,
  rotateX: number,
  rotateY: number,
  rotateZ: number,
  scale: number
}

export class Object3DMapComponent {
  private _lights: DirectionalLight[];
  private _camera: Camera;
  private _scene: Scene;
  private _renderer: WebGLRenderer;

  private _rotation: Object3DRotate;
  private _coordinates: Object3DCoordinates;

  private _transformModel: Object3DTransformModel;

  constructor(opts: Object3DMapComponentOptions) {
    this._camera = new Camera();
    this._scene = new Scene();
    this._renderer = new WebGLRenderer({
      canvas: opts.canvas,
      context: opts.renderingContext,
      alpha: opts.alpha,
      antialias: opts.antialias
    });
    this._renderer.autoClear = false;

    this._lights = [];

    if (opts.lights) {
      (Array.isArray(opts.lights) ? opts.lights : [opts.lights])
        .forEach((light: Light) => {
          this.setLight(light);
        });
    }

    this._rotation = opts.rotation || { x: 0, y: 0, z: 0 };
    this._coordinates = opts.coordinates;

    this._transformModel = Object3DMapComponent.getTransformModel(this._coordinates, 0, this._rotation);
  }

  get renderer() {
    return this._renderer;
  }

  get camera() {
    return this._camera;
  }

  get scene() {
    return this._scene;
  }

  get transformModel() {
    return this._transformModel;
  }

  get coordinates() {
    return this._coordinates;
  }

  get rotation() {
    return this._rotation;
  }

  public setLight(light: Light): DirectionalLight {
    let directionalLight: THREE.DirectionalLight = new DirectionalLight(light.color);

    directionalLight.position.set(light.position.x, light.position.y, light.position.z);
    directionalLight.position.normalize();

    this._lights.push(directionalLight);
    this._scene.add(directionalLight);

    return directionalLight;
  }

  public setTransformModel(coordinates: Object3DCoordinates, modelAltitude?: number, modelRotate?: Object3DRotate) {
    this._coordinates = coordinates;
    modelRotate ? this._rotation = modelRotate : null;

    this._transformModel = Object3DMapComponent.getTransformModel(coordinates, modelAltitude || 0, modelRotate || this._rotation);
  }

  public setTranslateModel(matrix: number[]) {
    const translateModel = Object3DMapComponent.getTranslateModel(this._transformModel, matrix);

    this._camera.projectionMatrix = translateModel.m.multiply(translateModel.l);
  }

  public static getTransformModel(coordinates: Object3DCoordinates, modelAltitude: number, modelRotate: Object3DRotate): Object3DTransformModel {
    const modelAsMercatorCoordinate: MercatorCoordinate = MercatorCoordinate.fromLngLat([coordinates.lat, coordinates.lng], modelAltitude);

    return {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z || 0,
      rotateX: modelRotate.x,
      rotateY: modelRotate.y,
      rotateZ: modelRotate.z,
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };
  }

  public static getTranslateModel(transformModel: Object3DTransformModel, matrix: number[]) {
    const rotationX: THREE.Matrix4 = new Matrix4().makeRotationAxis( new Vector3(1, 0, 0), transformModel.rotateX );
    const rotationY: THREE.Matrix4 = new Matrix4().makeRotationAxis( new Vector3(0, 1, 0), transformModel.rotateY );
    const rotationZ: THREE.Matrix4 = new Matrix4().makeRotationAxis( new Vector3(0, 0, 1), transformModel.rotateZ );

    const m: THREE.Matrix4 = new Matrix4().fromArray(matrix);
    const l: THREE.Matrix4 = new Matrix4()
      .makeTranslation( transformModel.translateX, transformModel.translateY, transformModel.translateZ || 0 )
      .scale( new Vector3(transformModel.scale, -transformModel.scale, transformModel.scale) )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    return { m, l };
  }
}

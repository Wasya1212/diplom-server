import { Object3D } from "./Object3D";
import { Object3DMapComponent, Object3DCoordinates } from "./object3DMapComponent";
import {MathUtils} from "three";

export class Object3DLayer {
  private _model: Object3D;
  private _modelController: Object3DMapComponent | any;
  private _coordinates: Object3DCoordinates;
  private _scale?: number;
  private _rotation?: number;

  private _camera: THREE.Camera | any;
  private _scene: THREE.Scene | any;
  private _renderer: THREE.WebGLRenderer | any;

  public id: string;
  public type: string;

  protected map?: any;
  protected renderingContext?: WebGLRenderingContext;

  readonly renderingMode: string = '3d';

  constructor(opts: { id: string, type: string, model: Object3D, coordinates: Object3DCoordinates, scale?: number }) {
    this._model = opts.model;
    this.id = opts.id;
    this.type = opts.type;
    this._coordinates = opts.coordinates;
    this._scale = opts.scale;
  }

  get model() {
    return this._model;
  }

  get modelController() {
    return this._modelController;
  }

  get coordinates() {
    return this._coordinates;
  }

  get rotation(): number | undefined {
    return this._rotation;
  }

  set rotation(rotation: number | undefined) {
    this._rotation = MathUtils.degToRad(rotation || 0);
  }

  set scale(scale: number) {
    this._scale = scale;
  }

  public setCoordinates(newCoordinates: Object3DCoordinates) {
    this._coordinates = newCoordinates;
  }

  public setScale(scale: number) {
    this._scale = scale;
  }

  public setRotation(rotation: number) {
    this._rotation = MathUtils.degToRad(rotation);
  }

  public onAdd(map: any, gl: WebGLRenderingContext) {
    this._modelController =  new Object3DMapComponent({
      coordinates: this._coordinates,
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      renderingContext: gl,
      canvas: map.getCanvas(),
      lights: [
        { position: {x: 0, y: -70, z: 100}, color: 0xffffff },
        { position: {x: 0, y: 70, z: 100}, color: 0xffffff }
      ],
      scale: this._scale
    });

    this.map = map;
    this.renderingContext = gl;

    this._camera = this._modelController.camera;
    this._scene = this._modelController.scene;
    this._renderer = this._modelController.renderer;

    this.loadModel();
  }

  protected loadModel() {
    this._model.load((model: any) => {
      try {
        this._scene.add(model);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public render(gl: WebGLRenderingContext, matrix: number[]) {
    console.log("rrr", this._scale);

    this._modelController.setTransformModel(this._coordinates, undefined, { x: Math.PI / 2, y: this._rotation || 0, z: 0 }, this._scale || 1);
    this._modelController.setTranslateModel(matrix);

    this._renderer.state.reset();
    this._renderer.render(this._scene, this._camera);
    this.map.triggerRepaint();
  }
}

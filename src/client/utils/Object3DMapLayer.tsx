import { Object3D } from "./Object3D";
import { Object3DMapComponent, Object3DCoordinates } from "./object3DMapComponent";

export class Object3DLayer {
  private _model: Object3D;
  private _modelController: Object3DMapComponent | any;
  private _coordinates: Object3DCoordinates;

  private _camera: THREE.Camera | any;
  private _scene: THREE.Scene | any;
  private _renderer: THREE.WebGLRenderer | any;

  public id: string;
  public type: string;

  protected map?: any;
  protected renderingContext?: WebGLRenderingContext;

  readonly renderingMode: string = '3d';

  constructor(opts: { id: string, type: string, model: Object3D, coordinates: Object3DCoordinates }) {
    this._model = opts.model;
    this.id = opts.id;
    this.type = opts.type;
    this._coordinates = opts.coordinates;
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

  public setCoordinates(newCoordinates: Object3DCoordinates) {
    this._coordinates = newCoordinates;
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
      ]
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
    this._modelController.setTransformModel(this._coordinates);
    this._modelController.setTranslateModel(matrix);

    this._renderer.state.reset();
    this._renderer.render(this._scene, this._camera);
    this.map.triggerRepaint();
  }
}

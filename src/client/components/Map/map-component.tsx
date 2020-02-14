import React, { Component } from "react";

import "./map-style.sass";

import "../../assets/models/cybertruck/scene.gltf";
import "../../assets/models/cybertruck/scene.bin";
import "../../assets/models/cybertruck/tesla_ct_export1123.fbx";
import "../../assets/models/cybertruck/car.fbx";
import "../../assets/models/cybertruck/untitled.fbx";
import "../../assets/models/cybertruck/SHC Free Cybertruck.obj";
import "../../assets/models/audi/RS7.obj";

import "../../assets/models/cybertruck/textures/tex1_DSP.png";
import "../../assets/models/cybertruck/textures/tex1.png";
import "../../assets/models/cybertruck/textures/texLOD1.png";
import "../../assets/models/cybertruck/textures/texMain_NRM.png";
import "../../assets/models/cybertruck/textures/texMain_DSP.png";
import "../../assets/models/cybertruck/textures/texMain.png";

import { ENVIRONMENT } from "../../environment";

import ReactMapboxGl from "react-mapbox-gl";
import { MercatorCoordinate } from "mapbox-gl";
import {
  Layer,
  Source,
  Feature,
  ScaleControl,
  MapContext
} from "react-mapbox-gl";

import THREE, { MeshBasicMaterial, LoadingManager, Matrix4, Vector3, Camera, Scene, DirectionalLight, WebGLRenderer, TextureLoader } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { Object3D as ModelLoader, Object3D } from "../../utils/Object3D";
import { Object3DMapComponent, Object3DCoordinates } from "../../utils/object3DMapComponent";

interface Rotate {
  x: number,
  y: number,
  z: number
}



// mapboxgl.LngLat
function getTransformModel(lat: number, lon: number, modelAltitude: number, modelRotate: Rotate) {
  const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat([lat, lon], modelAltitude);

  return {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate.x,
    rotateY: modelRotate.y,
    rotateZ: modelRotate.z,
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
  };
}

let lon = 49.83498;
let lat = 24.03862;

var modelOrigin = [lat, lon];
var modelAltitude = 0;
var modelRotate = {
  x: Math.PI / 2,
  y: 0,
  z: 0
};

let modelTransform = getTransformModel(lat, lon, modelAltitude, modelRotate)

let CarModel = new ModelLoader({
  model: 'models/RS7.obj',
  onLoadProgress: (item: string, loaded: number, total: number) => {
    console.log("load texture:", item, loaded, total);
  },
  setLoadURLModifier: (url: string): string => (`${url}`),
  textures: ['/img/tex1_DSP.png', '/img/tex1.png', '/img/texLOD1.png', '/img/texMain_DSP.png', '/img/texMain.png', '/img/texMain_NRM.png']
});

class Object3DLayer {
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
    this._model.load((model) => {
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

let car3DModelLayer = new Object3DLayer({
  model: CarModel,
  id: '3d-model',
  type: 'custom',
  coordinates: { lat: 24.03862, lng: 49.83498 }
});

setInterval(() => {
  const { lat, lng } = car3DModelLayer.modelController.coordinates;

  car3DModelLayer.setCoordinates({ lat: lat + 0.00001, lng: lng + 0.00001 });

  console.log({ lat: lat + 0.00001, lng: lng + 0.00001 });
}, 100);

let customLayer: any = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function(map: any, gl: any) {
    this.carModelController = new Object3DMapComponent({
      coordinates: { lat: lat, lng: lon },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      renderingContext: gl,
      canvas: map.getCanvas(),
      lights: [
        { position: {x: 0, y: -70, z: 100}, color: 0xffffff },
        { position: {x: 0, y: 70, z: 100}, color: 0xffffff }
      ]
    });

    this.map = map;
    this.camera = this.carModelController.camera;
    this.scene = this.carModelController.scene;
    this.renderer = this.carModelController.renderer;

    CarModel.load((model) => { this.scene.add(model); });
    console.log(this)
  },

  render: function(gl: WebGLRenderingContext, matrix: number[]) {
    this.carModelController.setTransformModel({ lat: 24.03862, lng: 49.83498 }, modelRotate);
    this.carModelController.setTranslateModel(matrix);

    this.renderer.state.reset();
    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  }
}

// let customLayer: any = {
//   id: '3d-model',
//   type: 'custom',
//   renderingMode: '3d',
//   onAdd: function(map: any, gl: any) {
//     this.camera = new Camera();
//     this.scene = new Scene();
//
//     // create two three.js lights to illuminate the model
//     const directionalLight = new DirectionalLight(0xffffff);
//     directionalLight.position.set(0, -70, 100).normalize();
//
//     this.scene.add(directionalLight);
//
//     const directionalLight2 = new DirectionalLight(0xffffff);
//     directionalLight2.position.set(0, 70, 100).normalize();
//
//     this.scene.add(directionalLight2);
//
//     let CarModel = new ModelLoader({
//       model: 'models/RS7.obj',
//       onLoadProgress: (item: string, loaded: number, total: number) => {
//         console.log("load texture:", item, loaded, total);
//       },
//       setLoadURLModifier: (url: string): string => (`${url}`),
//       textures: ['/img/tex1_DSP.png', '/img/tex1.png', '/img/texLOD1.png', '/img/texMain_DSP.png', '/img/texMain.png', '/img/texMain_NRM.png']
//     });
//
//     CarModel.load((model) => { this.scene.add(model); });
//
//     this.map = map;
//
//     console.log(map)
//
//     // use the Mapbox GL JS map canvas for three.js
//     this.renderer = new WebGLRenderer({
//       canvas: map.getCanvas(),
//       context: gl,
//       antialias: true,
//       alpha: true
//     });
//
//     this.renderer.autoClear = false;
//   },
//
//   render: function(gl: any, matrix: any) {
//     var rotationX = new Matrix4().makeRotationAxis(
//       new Vector3(1, 0, 0),
//       modelTransform.rotateX
//     );
//     var rotationY = new Matrix4().makeRotationAxis(
//       new Vector3(0, 1, 0),
//       modelTransform.rotateY
//     );
//     var rotationZ = new Matrix4().makeRotationAxis(
//       new Vector3(0, 0, 1),
//       modelTransform.rotateZ
//     );
//
//     var m = new Matrix4().fromArray(matrix);
//     var l = new Matrix4()
//       .makeTranslation(
//         modelTransform.translateX,
//         modelTransform.translateY,
//         modelTransform.translateZ || 0
//       )
//       .scale(
//       new Vector3(
//         modelTransform.scale,
//         -modelTransform.scale,
//         modelTransform.scale
//       )
//       )
//       .multiply(rotationX)
//       .multiply(rotationY)
//       .multiply(rotationZ);
//
//     this.camera.projectionMatrix = m.multiply(l);
//     this.renderer.state.reset();
//     this.renderer.render(this.scene, this.camera);
//     this.map.triggerRepaint();
//   }
// }

const Map = ReactMapboxGl({
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

class MapComponent extends Component {

  zoomControl = (map: any) => {
    if (map.getZoom() <= 16) {
      map.flyTo({
        pitch: 0,
        bearing: 0
      });
    } else {
      map.flyTo({
        pitch: 65,
        bearing: 20
      });
    }
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
          center={[car3DModelLayer.coordinates.lat, car3DModelLayer.coordinates.lng]}
          zoom={[17]}
          pitch={[0]}
          onZoom={this.zoomControl}
          onStyleLoad={(map: any) => {
            console.log("loaded 3D");
            map.addLayer(car3DModelLayer, 'waterway-label');
          }}
        >
        <MapContext.Consumer>
          {(map: any): any => {
            // console.log("loaded 3D")
            // map.addLayer(customLayer, 'waterway-label');
          }}
        </MapContext.Consumer>
        <ScaleControl position="top-right"/>
        <BuildingsLayer3DComponent />
        </Map>
      </div>
    )
  }
}

export default MapComponent;

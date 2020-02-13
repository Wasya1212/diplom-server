import React, { Component } from "react";

import "./map-style.sass";

import "../../assets/models/cybertruck/scene.gltf";
import "../../assets/models/cybertruck/scene.bin";
import "../../assets/models/cybertruck/tesla_ct_export1123.fbx";
import "../../assets/models/cybertruck/car.fbx";
import "../../assets/models/cybertruck/untitled.fbx";
import "../../assets/models/cybertruck/SHC Free Cybertruck.obj";

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

let customLayer: any = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function(map: any, gl: any) {
    this.camera = new Camera();
    this.scene = new Scene();

    // create two three.js lights to illuminate the model
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();

    this.scene.add(directionalLight);

    const directionalLight2 = new DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();

    this.scene.add(directionalLight2);

    const oldTextures = [
      './texLOD1_NRM.png'
    ];
    const newTextures = [
      './img/texMain_NRM.png'
    ];

    const manager = new LoadingManager();
    manager.onProgress = function (item, loaded, total) {
      console.log("load texture:", item, loaded, total);
    };
    manager.setURLModifier((url: string): string => {
      console.log(url);
      if (url == oldTextures[0]) {
        url = newTextures[0];
      }

      return url;
    });

    const textureLoader = new TextureLoader(manager);

    const vehicleTextureMain1: THREE.Texture = textureLoader.load('/img/tex1_DSP.png');
    const vehicleTextureMain2: THREE.Texture = textureLoader.load('/img/tex1.png');
    const vehicleTextureMain3: THREE.Texture = textureLoader.load('/img/texLOD1.png');
    const vehicleTextureMain4: THREE.Texture = textureLoader.load('/img/texMain_DSP.png');
    const vehicleTextureMain5: THREE.Texture = textureLoader.load('/img/texMain.png');
    const vehicleTextureMain6: THREE.Texture = textureLoader.load('/img/texMain_NRM.png');

    // use the three.js GLTF loader to add the 3D model to the three.js scene
    const loader = new FBXLoader();
    loader.load(
      // 'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
      'models/car.fbx',
      (model: any) => {
        model.traverse(function(child: THREE.Object3D) {
  	      // if ( child instanceof THREE.Mesh ) {
            console.log(child.children);
            try {
              // child.children.forEach((c) => {
              //   // @ts-ignore
              //   c.material.map = [
              //     vehicleTextureMain1,
              //     vehicleTextureMain2,
              //     vehicleTextureMain3,
              //     vehicleTextureMain4,
              //     vehicleTextureMain5,
              //     vehicleTextureMain6
              //   ];
              // });
            } catch (err) {}
            // @ts-ignore
            // child.material.map.image = "https://lh3.googleusercontent.com/proxy/6-7XPDzvcj_yGXjZgHMmvdl4Gb6eVabJ-3Cow3wVDNNUux2Jt7-5by-4bdEIq5Xre2VWcYvW6AI6DixQDISV1EUFEcCNg9C8HaNlHmleeVDqap-SCNDGGxEu5DUSJh4JWsXv1kZ6lgKQbYCuiKB3zS1XnLCzaArc75u8sdKAR3qosOBMNe2XP6tk"
          //   // @ts-ignore
  	      //   // child.material.map = [
          //   //   vehicleTextureMain1,
          //   //   vehicleTextureMain2,
          //   //   vehicleTextureMain3,
          //   //   vehicleTextureMain4,
          //   //   vehicleTextureMain5,
          //   //   vehicleTextureMain6
          //   // ];
          //   // child.material.map = vehicleTextureMain1;
          //   // // @ts-ignore
          //   // child.material.needsUpdate = true;
  	      // }
  	    });
        this.scene.add(model);
      }
    );

    this.map = map;

    // use the Mapbox GL JS map canvas for three.js
    this.renderer = new WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
      alpha: true
    });

    this.renderer.autoClear = false;
  },

  render: function(gl: any, matrix: any) {
    var rotationX = new Matrix4().makeRotationAxis(
      new Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    var rotationY = new Matrix4().makeRotationAxis(
      new Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    var rotationZ = new Matrix4().makeRotationAxis(
      new Vector3(0, 0, 1),
      modelTransform.rotateZ
    );

    var m = new Matrix4().fromArray(matrix);
    var l = new Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ || 0
      )
      .scale(
      new Vector3(
        modelTransform.scale,
        -modelTransform.scale,
        modelTransform.scale
      )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    this.camera.projectionMatrix = m.multiply(l);
    this.renderer.state.reset();
    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  }
}

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

  zoomControl = (map: mapboxgl.Map) => {
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
          center={[24.03862, 49.83498]}
          zoom={[15]}
          pitch={[0]}
          onZoom={this.zoomControl}
          onStyleLoad={(map: any) => {
            console.log("loaded 3D");
            map.addLayer(customLayer, 'waterway-label');
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

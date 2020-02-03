import React, { Component } from "react";

import "./map-style.sass";

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

import THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

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

let customLayer = {
  satelite: null,
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function(map: any, gl: any) {
    // @ts-ignore
    this.camera = new THREE.Camera();
    // @ts-ignore
    this.scene = new THREE.Scene();

    // create two three.js lights to illuminate the model
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    // @ts-ignore
    this.scene.add(directionalLight);

    var directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    // @ts-ignore
    this.scene.add(directionalLight2);

    // use the three.js GLTF loader to add the 3D model to the three.js scene

    var loader = new GLTFLoader();
      loader.load(
      'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
      function(gltf: any) {
        gltf.name = 'satelite';
        // @ts-ignore
        this.satelite = gltf;
        // @ts-ignore
        this.scene.add(gltf.scene);
      }.bind(this)
    );
    // @ts-ignore
    this.map = map;

    // use the Mapbox GL JS map canvas for three.js
    // @ts-ignore
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true
    });
    // @ts-ignore
    this.renderer.autoClear = false;
  },

  render: function(gl: any, matrix: any) {
    var rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    var rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    var rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
    );

    var m = new THREE.Matrix4().fromArray(matrix);
    var l = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        // @ts-ignore
        modelTransform.translateZ
      )
      .scale(
      new THREE.Vector3(
        modelTransform.scale,
        -modelTransform.scale,
        modelTransform.scale
      )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    // @ts-ignore
    this.camera.projectionMatrix = m.multiply(l);
    // @ts-ignore
    this.renderer.state.reset();
    // @ts-ignore
    this.renderer.render(this.scene, this.camera);
    // @ts-ignore
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
          onStyleDataLoading={(map: any) => {
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

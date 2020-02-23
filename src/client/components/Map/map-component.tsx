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
import {
  Layer,
  Source,
  Feature,
  ScaleControl,
  MapContext
} from "react-mapbox-gl";

import { Object3D as ModelLoader } from "../../utils/Object3D";
import { Object3DLayer } from "../../utils/Object3DMapLayer";

// import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

import MapboxDirections from "../../utils/direction";

import axios from "axios";

// console.log(MapboxDirections)

// let directions = new MapboxDirections({
//   accessToken: ENVIRONMENT.mapbox.accessToken,
//   unit: 'metric',
//   profile: 'mapbox/cycling'
// });


let CarModel = new ModelLoader({
  model: 'models/RS7.obj',
  onLoadProgress: (item: string, loaded: number, total: number) => {
    console.log("load texture:", item, loaded, total);
  },
  setLoadURLModifier: (url: string): string => (`${url}`),
  textures: ['/img/tex1_DSP.png', '/img/tex1.png', '/img/texLOD1.png', '/img/texMain_DSP.png', '/img/texMain.png', '/img/texMain_NRM.png']
});

let car3DModelLayer = new Object3DLayer({
  model: CarModel,
  id: '3d-model',
  type: 'custom',
  coordinates: { lat: 24.03862, lng: 49.83498 }
});

setInterval(() => {
  const { lat, lng } = car3DModelLayer.coordinates;

  car3DModelLayer.setCoordinates({ lat: lat + 0.00001, lng: lng + 0.00001 });
}, 100);

let Map = ReactMapboxGl({
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
            // map.addControl(directions, 'top-left');

            axios
              .get(`https://api.mapbox.com/directions/v5/mapbox/driving/-122.42,37.78;-77.03,38.91?access_token=${ENVIRONMENT.mapbox.accessToken}`)
              .then(({data}) => {
                console.log(data);
              })
              .catch(err => {
                console.error(err);
              })
          }}
          onMouseMove={(e: any) => {
            // console.log(e)
          }}
        >
        <MapContext.Consumer>
          {(map: any): any => {
            map.on('mousemove', function(e) {
              console.log(e)
            })
            // console.log(directions)
            // map.addControl(directions, 'top-left');
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

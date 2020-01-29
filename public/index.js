mapboxgl.accessToken = 'pk.eyJ1Ijoid2FzeWExMjEyIiwiYSI6ImNrNXRmdDJwYTB2ajQzZW11N21samJ2cnUifQ.7lV47ah1DXWnbVY7JhGg-g';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [24.03862,49.83498],
  zoom: 15,
  pitch: 0
});

const POINTS_COORDS = [
  [-121.415061, 40.506229],
  [-121.505184, 40.488084],
  [-121.354465, 40.488737]
];

let marker = document.createElement('div');

marker.className = 'marker';
marker.style.backgroundImage = `url(http://localhost:3000/assets/car-icon.png)`;
marker.style.width = '70px';
marker.style.height = '70px';

var size = 200;

var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    // called once before every frame where the icon will be used
    render: function() {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};

const mapboxDirections = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'metric'
});

let startPosition = [24.02668,49.84172];
let finalDestination = [24.04125,49.83563];

function rotateCamera(timestamp) {
// clamp the rotation between 0 -360 degrees
// Divide timestamp by 100 to slow rotation to ~10 degrees / sec
  map.rotateTo((timestamp / 100) % 360, { duration: 0 });
// Request the next frame of the animation.
  requestAnimationFrame(rotateCamera);
}

map.on('zoom', () => {
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
});

map.on('load', () => {
  // rotateCamera(0);

  map.addControl(
    mapboxDirections,
    'top-left'
  );

  mapboxDirections.setOrigin(startPosition);
  mapboxDirections.setDestination(finalDestination);

  mapboxDirections.interactive = true;


  // console.log(mapboxDirections.getRoute());



  mapboxDirections.on('route', ({route}) => {
    const geom = polyline.decode(route[0].geometry.toString()).map(el => ([el[1], el[0]]));

    try {
      map.removeLayer('line');
      map.removeSource('line');
    } catch (err) {
      console.error(err);
    } finally {
      mapboxDirections.removeRoutes();
    }

    map.addSource('line', {
      type: 'geojson',
      lineMetrics: true,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: geom,
              type: 'LineString'
            }
          }
        ]
      }
    });

    map.addLayer({
      type: 'line',
      source: 'line',
      id: 'line',
      paint: {
        'line-color': 'red',
        'line-width': 14,
        // 'line-gradient' must be specified using an expression
        // with the special 'line-progress' property
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, 'blue',
          1, 'red'
        ]
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      }
    });

    let start_driving_btn = document.getElementById('driving-button');

    start_driving_btn.addEventListener('click', e => {
      alert('s');
    });

    const carMarker = new mapboxgl.Marker(marker).setLngLat(geom[0]);

    carMarker.addTo(map);
  });

  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

  map.addSource('Road way', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: POINTS_COORDS.map(point_coord => (
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: point_coord }
        }
      ))
    }
  });

  map.addLayer({
    'id': 'locations',
    'type': 'circle',
    'source': 'Road way',
    'paint': {
        'circle-radius': 12,
        'circle-color': '#2261b4'
    },
    'filter': ['==', '$type', 'Point']
  });

  map.addLayer({
            'id': 'points',
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-121.505184, 40.58184]
                            }
                        }
                    ]
                }
            },
            'layout': {
                'icon-image': 'pulsing-dot'
            }
        });

        map.addLayer({
'id': '3d-buildings',
'source': 'composite',
'source-layer': 'building',
'filter': ['==', 'extrude', 'true'],
'type': 'fill-extrusion',
'minzoom': 15,
'paint': {
'fill-extrusion-color': '#aaa',

// use an 'interpolate' expression to add a smooth transition effect to the
// buildings as the user zooms in
'fill-extrusion-height': [
'interpolate',
['linear'],
['zoom'],
15,
0,
15.05,
['get', 'height']
],
'fill-extrusion-base': [
'interpolate',
['linear'],
['zoom'],
15,
0,
15.05,
['get', 'min_height']
],
'fill-extrusion-opacity': 0.6
}
});
});

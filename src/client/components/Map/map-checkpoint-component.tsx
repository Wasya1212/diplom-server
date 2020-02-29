import React, { Component } from "react";
import { Layer, Source } from "react-mapbox-gl";

interface CheckpointProps {
  iconScale?: number,
  icon?: string,
  textColor?: string,
  points?: {
    lng: number,
    lat: number
  }[]
}

interface CheckpointState {
  sourceOptions: any,
  layerOptions: any,
  sourceId: string,
  layerId: string
}

export default class Checkpoint extends Component<CheckpointProps, CheckpointState> {
  constructor(props) {
    super(props);

    const CURRENT_DATE = Date.now().toString();

    this.state = {
      sourceId: `checkpoint-source-${CURRENT_DATE}`,
      layerId: `checkpoint-layer-${CURRENT_DATE}`,
      sourceOptions: this.getSourceOptions(),
      layerOptions: this.getLayerOptions()
    };
  }

  componentDidUpdate(prevProps) {
    console.log("upldate!")
    if (this.props.points != prevProps.points) {
      this.setState({
        sourceOptions: this.getSourceOptions(),
        layerOptions: this.getLayerOptions()
      });
    }
  }

  private getSourceOptions() {
    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: (this.props.points || []).map((point, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lat, point.lng]
          },
          properties: {
            icon: this.props.icon || 'marker-15',
            title: `${index + 1}`
          }
        }))
      }
    };
  }

  private getLayerOptions() {
    return {
      paint: this.props.textColor ? { 'text-color': this.props.textColor } : {},
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 40,
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'icon-size': this.props.iconScale || 2,
        'icon-ignore-placement': true,
        'icon-image': ['concat', ['get', 'icon'], ''],
        'text-allow-overlap': true,
        'symbol-placement': 'point'
      }
    };
  }

  render() {
    return(
      <div>
        <Source id={this.state.sourceId} tileJsonSource={this.state.sourceOptions} />
        <Layer
          type="symbol"
          paint={this.state.layerOptions.paint}
          layout={this.state.layerOptions.layout}
          id={this.state.layerId}
          sourceId={this.state.sourceId}
        />
      </div>
    );
  }
}

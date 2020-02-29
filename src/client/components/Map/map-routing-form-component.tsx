import React, { Component } from "react";

interface RoutingFormState {
  lat: number,
  lng: number
}

interface RoutingFormProps {
  lat: number,
  lng: number,
  handleClick?: () => void
}

export default class RoutingForm extends Component<RoutingFormProps, RoutingFormState> {
  state = {
    lng: this.props.lng,
    lat: this.props.lat
  }

  setCoords = (coords: {lng: number, lat: number}) => {
    this.setState({lng: coords.lng, lat: coords.lat});
  }

  setLat = (e) => {
    this.setState({lat: e.value});
  }

  setLng = (e) => {
    this.setState({lat: e.value});
  }

  render() {
    return (
      <form className="route-form">
        <input onChange={this.setLat} type="text" value={this.props.lat || ""} placeholder="Latitude..."/>
        <input onChange={this.setLng} type="text" value={this.props.lng || ""} placeholder="Longitude..."/>
        <button type="button" onClick={this.props.handleClick}>Add point</button>
      </form>
    );
  }
}

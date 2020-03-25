import React, { Component } from "react";

import mapboxgl from 'mapbox-gl';

import { Greeter } from "./components/Greeter";
import { Map } from "./components/Map";
import { Header } from "./components/Header";
import { Login } from "./components/Login";
import { SignUp } from "./components/Signup";

import { BrowserRouter, Switch, Route } from 'react-router-dom';

class App extends Component<{}, {}> {
  mapContainer: any;

  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <Header />
          <Switch>
            <Route exact path="/" component={Greeter} />
            <Route path="/login" component={Login} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/map" component={Map} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";

import mapboxgl from 'mapbox-gl';

import { Greeter } from "./components/Greeter";
import { Map } from "./components/Map";
import Header from "./components/Header";
import Login from "./components/Login";
import { SignUp } from "./components/Signup";
import { Profile } from "./components/Profile";

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
            <Route exact path="/">
              <Greeter>Hello beaches</Greeter>
            </Route>
            <Route path="/login">
              <Login successRedirect="/profile" />
            </Route>
            <Route path="/sign-up">
              <SignUp />
            </Route>
            <Route path="/map">
              <Map />
            </Route>
            <Route path="/profile">
              <Profile />
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;

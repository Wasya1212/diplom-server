import React, { Component } from "react";

import mapboxgl from 'mapbox-gl';

import { Greeter } from "./components/Greeter";
import { Map } from "./components/Map";
import Header from "./components/Header";
import Login from "./components/Login";
import Feed from "./components/Feed";
import { SignUp } from "./components/Signup";
import { Profile } from "./components/Profile";

import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { connect } from "react-redux";

import axios from "axios";

class App extends Component<any, {}> {
  mapContainer: any;

  constructor(props: {}) {
    super(props);
  }

  componentDidMount() {
    axios
      .post('/authenticate', {})
      .then(({data}) => {
        this.props.addUser(data);

        if (data == {} || data == "") {
          this.props.addUser(null);

          if (window.location.pathname !== "/sign-up") {
            window.location.replace("/login");
          }
        } else if (window.location.pathname == "/login") {
          window.location.replace("/profile");
        }
      })
      .catch(err => {
        if (window.location.pathname !== "/login" && window.location.pathname !== "/sign-up") {
          window.location.replace("/login");
        }
      });
  }

  render() {
    if (!this.props.store.user && window.location.pathname !== "/login" && window.location.pathname !== "/sign-up") {
      return (
        <div></div>
      );
    } else {
      return (
        <div>
          <BrowserRouter>
            <Header />
            <Switch>
              <Route exact path="/">
                <Feed></Feed>
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
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addUser: (user) => {
      dispatch({ type: "ADD_USER", payload: user});
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

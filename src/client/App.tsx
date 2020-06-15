import React, { Component } from "react";

import io from 'socket.io-client';

import mapboxgl from 'mapbox-gl';

import { Greeter } from "./components/Greeter";
import { Map } from "./components/Map";
import Header from "./components/Header";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Project from "./components/Project";
import Settings from "./components/Settings";
import { SignUp } from "./components/Signup";
import { Profile } from "./components/Profile";

import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { connect } from "react-redux";

import axios from "axios";

const ENDPOINT = "http://127.0.0.1:5000";

class App extends Component<any, {}> {
  mapContainer: any;

  constructor(props: {}) {
    super(props);
  }

  componentDidMount = async () => {
    try {
      const authResponse: any = await axios.post('/authenticate', {});
      const {user, token} = authResponse.data;

      const socket = io(ENDPOINT);

      socket.on('connect', () => {
        console.log("SOCKET CONNECTED");
      })

      const userProjectsResponse: any = await axios.get('/user/projects');
      user.projects = userProjectsResponse.data;

      console.log("DA", user.projects)

      this.props.addUser(user);
      this.props.chooseProject(user.projects[0]);
      this.props.authenticate({auth_token: token, web_socket: socket});

      if (authResponse.data == {} || authResponse.data == "") {
        this.props.addUser(null);

        if (window.location.pathname !== "/sign-up") {
          window.location.replace("/login");
        }
      } else if (window.location.pathname == "/login") {
        window.location.replace("/profile");
      }
    } catch (err) {
      if (window.location.pathname !== "/login" && window.location.pathname !== "/sign-up") {
        window.location.replace("/login");
      }
    }
    // axios
    //   .post('/authenticate', {})
    //   .then(({data}) => {
    //     console.log("AUTHORIZE:", data)
    //     this.props.addUser(data.user);
    //     this.props.authenticate(data.token);
    //
    //     axios.get
    //
    //     // if (data._id) {
    //     //
    //     // }
    //     // this.props.chooseProject();
    //
    //     if (data == {} || data == "") {
    //       this.props.addUser(null);
    //
    //       if (window.location.pathname !== "/sign-up") {
    //         window.location.replace("/login");
    //       }
    //     } else if (window.location.pathname == "/login") {
    //       window.location.replace("/profile");
    //     }
    //   })
    //   .catch(err => {
    //     if (window.location.pathname !== "/login" && window.location.pathname !== "/sign-up") {
    //       window.location.replace("/login");
    //     }
    //   });
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
              <Route path="/project">
                <Project />
              </Route>
              <Route path="/settings">
                <Settings />
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
    },
    chooseProject: (project) => {
      dispatch({ type: "CHOOSE_PROJECT", payload: project })
    },
    authenticate: (authData) => {
      dispatch({ type: "AUTHENTICATE", payload: authData });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

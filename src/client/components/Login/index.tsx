import React, { Component } from "react";

import { Redirect } from "react-router-dom";

import { connect } from "react-redux";

import { LoginForm } from "./login-form-component";

interface LoginState {
  loggedIn: boolean
}

interface LoginProps {
  successRedirect: string
}

class Login extends Component<any, LoginState> {
  state = {
    loggedIn: this.props.store.user ? true : false
  }

  logIn = () => {
    this.setState({ loggedIn: true });
  }

  storeUser = (user) => {
    console.log("USER data:", user);

    this.props.onAddUser(user);
    this.props.authenticate({auth_token: user.token});

    if (user.projects && user.projects.length > 0) {
      this.props.chooseProject(user.projects[0]);
    }
  }

  render() {
    return (
      <main className="login-component">
        {
          this.state.loggedIn
            ? <Redirect to={this.props.successRedirect} />
            : <LoginForm getUser={this.storeUser} success={this.logIn} />
        }
      </main>
    );
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onAddUser: (user) => {
      dispatch({ type: "ADD_USER", payload: user});
    },
    authenticate: (token) => {
      dispatch({ type: "AUTHENTICATE", payload: token });
    },
    chooseProject: (project) => {
      dispatch({ type: "CHOOSE_PROJECT", payload: project })
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

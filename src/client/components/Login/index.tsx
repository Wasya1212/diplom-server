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

  render() {
    return (
      <main className="login-component">
        {
          this.state.loggedIn
            ? <Redirect to={this.props.successRedirect} />
            : <LoginForm getUser={this.props.onAddUser} getToken={this.props.authenticate} success={this.logIn} />
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
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

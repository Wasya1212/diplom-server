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
    loggedIn: false
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
            : <LoginForm getUser={this.props.onAddUser} success={this.logIn}/>
        }
      </main>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onAddUser: (user) => {
      dispatch({ type: "ADD_USER", payload: user});
    }
  };
}

export default connect(() => ({}), mapDispatchToProps)(Login);

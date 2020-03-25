import React, { Component } from "react";

import { LoginForm } from "./login-form-component";

export class Login extends Component {
  render() {
    return (
      <main className="login-component">
        <LoginForm />
      </main>
    );
  }
}

import React, { Component } from "react";

import { SignUpForm } from "./sign-up-form-component";

export class SignUp extends Component {
  render() {
    return (
      <main className="sign-up-component">
        <SignUpForm />
      </main>
    );
  }
}

import React, { Component } from "react";

import axios from "axios";

interface LoginFormState {
  login: string,
  password: string
}

interface LoginFormProps {

}

export class LoginForm extends Component<LoginFormProps, LoginFormState> {
  state = {
    login: "",
    password: ""
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post('http://localhost:5000/login', this.state)
      .then(({ data }) => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    let val = {};
    val[e.currentTarget.name] = e.currentTarget.value.toString();

    this.setState(val);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input value={this.state.login} onChange={this.handleChange} name="login" type="text" placeholder="email or phone number" />
        <input value={this.state.password} onChange={this.handleChange} name="password" type="password" placeholder="password" />
        <button type="submit">Sign in</button>
      </form>
    );
  }
}

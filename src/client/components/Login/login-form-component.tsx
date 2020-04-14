import React, { Component } from "react";

import axios from "axios";

interface LoginFormState {
  login: string,
  password: string
}

interface LoginFormProps {
  success: () => void,
  getUser?: (any: any) => void,
  getToken?: (any: any) => void
}

export class LoginForm extends Component<LoginFormProps, LoginFormState> {
  state = {
    login: "",
    password: ""
  }

  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userResponse = await axios.post('/login', { email: this.state.login, password: this.state.password });
    const userProjectsResponse = await axios({
      method: 'GET',
      url: '/user/projects',
      headers: { 'authorization': userResponse.data.token }
    });

    // console.log("ASDAS", userResponse.data)

    const {user} = userResponse.data;
    user.projects = userProjectsResponse.data;

    // if (userProjectsResponse.data && Array.isArray(userProjectsResponse)) {
    //   this.props.chooseProject();
    // }
    //
    if (this.props.getUser) {
      this.props.getUser(user);
    }
    //
    // if (this.props.getToken) {
    //   this.props.getToken(userResponse.data.token);
    // }

    this.props.success();
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

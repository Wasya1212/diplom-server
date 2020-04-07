import React, { Component } from "react";

import axios from "axios";

interface SignUpFormState {
  fName: string,
  mName: string,
  lName: string,
  phone: string,
  email: string,
  password: string,
  retypePassword: string
}

interface SignUpFormProps {
  isWorker: boolean
}

export class SignUpForm extends Component<SignUpFormProps, SignUpFormState> {
  state = {
    fName: "",
    lName: "",
    mName: "",
    password: "",
    retypePassword: "",
    email: "",
    phone: ""
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post('http://localhost:5000/sign-up', Object.assign(this.state, { isWorker: this.props.isWorker }))
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
        <input value={this.state.fName} onChange={this.handleChange} name="fName" type="text" placeholder="first name" />
        <input value={this.state.mName} onChange={this.handleChange} name="mName" type="text" placeholder="middle name" />
        <input value={this.state.lName} onChange={this.handleChange} name="lName" type="text" placeholder="last name" />
        <input value={this.state.email} onChange={this.handleChange} name="email" type="email" placeholder="email" />
        <input value={this.state.phone} onChange={this.handleChange} name="phone" type="text" placeholder="phone number" />
        <input value={this.state.password} onChange={this.handleChange} name="password" type="password" placeholder="password" />
        <input value={this.state.retypePassword} onChange={this.handleChange} name="retypePassword" type="password" placeholder="retype password" />
        <button type="submit">Sign in</button>
      </form>
    );
  }
}

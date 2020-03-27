import React, { Component } from "react";

import { Redirect } from 'react-router-dom';

import { connect } from "react-redux";

import axios from "axios";

function MergeRecursive(obj1, obj2) {
  for (var p in obj2) {
    try {
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      obj1[p] = obj2[p];
    }
  }

  return obj1;
}

class Profile extends Component<any, any> {
  state = {
    picture: "",
    name: this.props.store.user.name
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append(name, this.state.picture);

    axios
      // .put(`/user/${this.props.store.user._id}`, data)
      .put('/user', data)
      .then(({data}) => {
        console.log(data)
      })
      .catch(err => {
        console.error(err);
      })
  }

  handleFileChange = (e) => {
    let obj = {};
    obj[e.target.name] = e.target.files[0];

    this.setState(obj);
  }

  handleTextChange = (e) => {
    let props = e.currentTarget.name.split('.').map(prop => (`{"${prop}":`));
    let jsonObj = props.join('') + `"${e.currentTarget.value}"`;

    for (let i = 0; i < props.length; i++) {
      jsonObj += "}";
    }

    let obj = JSON.parse(jsonObj);

    this.setState(MergeRecursive(this.state, obj));
  }

  render() {
    if (!this.props.store.user) {
      return (
        <Redirect to="/" />
      );
    } else {
      return (
        <main>
          {
            this.props.store.user.photo
              ? <img className="user-avatar-img" src={this.props.store.user.photo} />
              : (
                  <form onSubmit={this.handleSubmit}>
                    <input onChange={this.handleFileChange} name="picture" type="file" />
                    <button type="submit">upload</button>
                  </form>
                )
          }
          {
            (!this.props.store.user.name)
              ? <p>{this.props.store.user.name.fName} {this.props.store.user.name.mName} {this.props.store.user.name.lName}</p>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} value={this.state.name.fName} name="name.fName" type="text" />
                  <input onChange={this.handleTextChange} value={this.state.name.mName} name="name.mName" type="text" />
                  <input onChange={this.handleTextChange} value={this.state.name.lName} name="name.lName" type="text" />
                  <button type="submit">upload</button>
                </form>
          }
        </main>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

export default connect(mapStateToProps, () => ({}))(Profile);

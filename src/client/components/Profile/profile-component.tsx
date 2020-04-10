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
  state: any = {
    user: {},
    usernameEdit: this.props.store.user.name ? false : true,
    userPictureEdit: this.props.store.user.photo ? false : true,
    userPhoneEdit: this.props.store.user.phone ? false : true,
    userBirthEdit: this.props.store.user.personalInfo.birthDate ? false : true,
    userChildrensEdit: this.props.store.user.personalInfo.childrens ? false : true,
    userAddressEdit: this.props.store.user.personalInfo.address ? false : true,
    userPostEdit: this.props.store.user.workInfo.post ? false : true
  }

  clearState() {
    this.setState({
      user: {},
      usernameEdit: false,
      userPictureEdit: false,
      userPhoneEdit: false,
      userBirthEdit: false,
      userChildrensEdit: false,
      userAddressEdit: false,
      userPostEdit: false
    });
  }

  chooseEdit = (e) => {
    const obj = {};
    obj[`${e.currentTarget.name}Edit`] = true;

    this.clearState();
    this.setState(obj);
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(this.state.user).forEach((prop: string) => {
      if (this.state.user[prop].lastModified || typeof this.state.user[prop] !== 'object') {
        data.append(prop, this.state.user[prop]);
      } else {
        data.append(prop, JSON.stringify(this.state.user[prop]));
      }
    });

    data.append("userId", this.props.store.user._id);

    console.log('log', this.props.store.auth_token)

    axios
      .put('/update/user', data, {
        headers: {
          authorization: this.props.store.auth_token
        }
      })
      .then(({data}) => {
        this.props.onAddUser(data);
        this.clearState();
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleFileChange = (e) => {
    let obj = {};
    obj[e.target.name] = e.target.files[0];

    this.setState({ user: obj });
  }

  handleTextChange = (e) => {
    let props = e.currentTarget.name.split('.').map(prop => (`{"${prop}":`));
    let jsonObj = props.join('') + `"${e.currentTarget.value}"`;

    for (let i = 0; i < props.length; i++) {
      jsonObj += "}";
    }

    let obj = JSON.parse(jsonObj);

    console.log("sdfsdfsdf", JSON.stringify(obj));

    this.setState({ user: MergeRecursive(this.state.user, obj) });
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
            (this.props.store.user.photo && !this.state.userPictureEdit)
              ? <div>
                  <img className="user-avatar-img" src={this.props.store.user.photo} />
                  <button name="userPicture" onClick={this.chooseEdit}>Edit</button>
                </div>
              : (
                  <form onSubmit={this.handleSubmit}>
                    <input onChange={this.handleFileChange} name="photo" type="file" />
                    <button type="submit">upload</button>
                  </form>
                )
          }
          {
            (this.props.store.user.name && !this.state.usernameEdit)
              ? <div>
                  <p>{this.props.store.user.name.fName} {this.props.store.user.name.mName} {this.props.store.user.name.lName}</p>
                  <button name="username" onClick={this.chooseEdit}>Edit</button>
                </div>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.name.fName || "first name"} name="name.fName" type="text" />
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.name.mName || "middle name"} name="name.mName" type="text" />
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.name.lName || "last name"} name="name.lName" type="text" />
                  <button type="submit">upload</button>
                </form>
          }
          {
            <div><p>Email: {this.props.store.user.email}</p></div>
          }
          {
            (this.props.store.user.phone && !this.state.userPhoneEdit)
              ? <div>
                  <p>Phone: {this.props.store.user.phone}</p>
                  <button name="userPhone" onClick={this.chooseEdit}>Edit</button>
                </div>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.phone || "phone number"} name="phone" type="text" />
                  <button type="submit">upload</button>
                </form>
          }
          {
            (this.props.store.user.personalInfo.birthDate && !this.state.userBirthEdit)
              ? <div>
                  <p>Birth date: {this.props.store.user.personalInfo.birthDate}</p>
                  <button name="userBirth" onClick={this.chooseEdit}>Edit</button>
                </div>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.personalInfo.birthDate} name="personalInfo.birthDate" type="date" />
                  <button type="submit">upload</button>
                </form>
          }
          {
            (this.props.store.user.personalInfo.childrens && !this.state.userChildrensEdit)
              ? <div>
                  <p>Childrens: {this.props.store.user.personalInfo.childrens}</p>
                  <button name="userChildrens" onClick={this.chooseEdit}>Edit</button>
                </div>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.personalInfo.childrens || "childrens count"} name="personalInfo.childrensCount" type="number" />
                  <button type="submit">upload</button>
                </form>
          }
          {
            (this.props.store.user.personalInfo.address && !this.state.userAddressEdit)
              ? <div>
                  <p>{this.props.store.user.personalInfo.address.country} {this.props.store.user.personalInfo.address.city} {this.props.store.user.personalInfo.address.street} {this.props.store.user.personalInfo.address.apartments}</p>
                  <button name="userAddress" onClick={this.chooseEdit}>Edit</button>
                </div>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.personalInfo.address ? this.props.store.user.personalInfo.address.country : "country"} name="personalInfo.address.country" type="text" />
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.personalInfo.address ? this.props.store.user.personalInfo.address.city : "city"} name="personalInfo.address.city" type="text" />
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.personalInfo.address ? this.props.store.user.personalInfo.address.street : "street"} name="personalInfo.address.street" type="text" />
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.personalInfo.address ? this.props.store.user.personalInfo.address.apartments : "apartments"} name="personalInfo.address.apartments" type="text" />
                  <button type="submit">upload</button>
                </form>
          }
          {
            (this.props.store.user.workInfo.post && !this.state.userPostEdit)
              ? <div>
                  <p>{this.props.store.user.workInfo.post}</p>
                  <button name="userPost" onClick={this.chooseEdit}>Edit</button>
                </div>
              : <form onSubmit={this.handleSubmit}>
                  <input onChange={this.handleTextChange} placeholder={this.props.store.user.workInfo.post || "post"} name="workInfo.post" type="text" />
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

function mapDispatchToProps(dispatch) {
  return {
    onAddUser: (user) => {
      dispatch({ type: "ADD_USER", payload: user });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
import React, { Component } from "react";

import { Link } from 'react-router-dom';

import { connect } from "react-redux";

interface HeaderProps {
  store: any
}

class Header extends Component<any, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.store.user && this.props.store.user != {}) {
      return (
        <header>
          <nav>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/map">Map</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/sign-up">Sign up</Link></li>
          </nav>
          <div>
            username: {this.props.store.user ? this.props.store.user.name.fName : ''}
            userId: {this.props.store.user ? this.props.store.user._id : ''}
          </div>
        </header>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

export default connect(mapStateToProps, () => ({}))(Header);

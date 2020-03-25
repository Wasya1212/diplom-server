import React, { Component } from "react";

import { Link } from 'react-router-dom';

class Header extends Component<{}, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header>
        <nav>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/map">Map</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/sign-up">Sign up</Link></li>
        </nav>
      </header>
    );
  }
}

export default Header;

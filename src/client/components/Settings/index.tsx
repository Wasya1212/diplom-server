import React, { Component } from "react";

import axios from "axios";

import { connect } from "react-redux";

class Settings extends Component<any, any> {
  render() {
    return (
      <div className="setting-grid">
        {
          this.props.store.user.workInfo.additionalInfo.worker
            ? <p>ID: {this.props.store.user.workInfo.additionalInfo.workerID}</p>
            : null
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    store: state
  }
}

export default connect(mapStateToProps, () => ({}))(Settings);

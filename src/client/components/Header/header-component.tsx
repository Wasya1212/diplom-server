import React, { Component } from "react";

import { Link } from 'react-router-dom';

import { connect } from "react-redux";

import Modal from "../Modal";
import { CreateProjectForm } from "../Project";

interface HeaderProps {
  store: any
}

class Header extends Component<any, {}> {
  state = {
    addProjectModalIsOpen: false
  }

  constructor(props) {
    super(props);
  }

  onProjectCreate = (newProject) => {
    let updatedUser = this.props.store.user;
    updatedUser.projects = [...updatedUser.projects, newProject];

    this.props.onAddUser(updatedUser);
    this.hideAddProjectModal();
  }

  showAddProjectModal = () => {
    this.setState({ addProjectModalIsOpen: true });
  }

  hideAddProjectModal = () => {
    this.setState({ addProjectModalIsOpen: false });
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
            <li><a href="logout">logout</a></li>
          </nav>
          <menu>
            {
              ...this.props.store.user.projects.map((project, index) => (
                <li key={`project-menu-item-${index}`}>{project.name}</li>
              ))
            }
          </menu>
          {
            (!(this.props.store.user.workInfo.additionalInfo || {}).worker)
              ? <button onClick={this.showAddProjectModal}>create new project</button>
              : null
          }
          <div>
            username: {this.props.store.user ? this.props.store.user.name.fName : ''}
            userId: {this.props.store.user ? this.props.store.user._id : ''}
          </div>
          <Modal onClose={this.hideAddProjectModal} isOpen={this.state.addProjectModalIsOpen}>
            <CreateProjectForm onCreateProject={this.onProjectCreate} />
          </Modal>
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

function mapDispatchToProps(dispatch) {
  return {
    onAddUser: (user) => {
      dispatch({ type: "ADD_USER", payload: user});
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);

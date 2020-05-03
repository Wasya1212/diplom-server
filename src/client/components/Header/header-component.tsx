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
    addProjectModalIsOpen: false,
    navigationIsOpen: false
  }

  constructor(props) {
    super(props);
  }

  showNavigation = () => {
    this.setState({ navigationIsOpen: true });
  }

  hideNavigation = () => {
    this.setState({ navigationIsOpen: false });
  }

  toggleNavigation = () => {
    this.setState({ navigationIsOpen: !this.state.navigationIsOpen });
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
        <header className="header">
          <section onClick={this.toggleNavigation} className="header__profile">
            <span className="header__profile__username">{this.props.store.user.name.fName}</span>
            <span className="header__profile__post">{this.props.store.user.workInfo.post}</span>
            <div className="header__profile__photo"><img src={this.props.store.user.photo} alt={this.props.store.user.name.fName} /></div>
          </section>
          <nav className={`header__navigation${this.state.navigationIsOpen ? '' : ' hidden'}`}>
            <li className="header__navigation__item"><Link to="/">Profile</Link></li>
            <li className="header__navigation__item"><Link to="/">Control panel</Link></li>
            <li className="header__navigation__item"><Link to="/settings">Settings</Link></li>
            <li className="header__navigation__item"><a href="logout">logout</a></li>
          </nav>
          <menu className="header__projects-list">
            <div className="wrapper">
              {
                ...this.props.store.user.projects.map((project, index) => (
                  <li className="header__projects-list__item" key={`project-menu-item-${index}`}>{project.name}</li>
                ))
              }
            </div>
          </menu>
          {
            (!(this.props.store.user.workInfo.additionalInfo || {}).worker)
              ? <li className="header__project__add-btn"><button onClick={this.showAddProjectModal}>create new project</button></li>
              : null
          }
          <form className="header__search-form">
            <input name="searchData" placeholder="worker, product, route..." />
          </form>
          <div className="header__logo">Diplom</div>
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

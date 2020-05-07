import React, { Component } from "react";

import axios from "axios";

import { connect } from "react-redux";

import { Redirect } from 'react-router-dom';

export class CreateProjectForm extends Component<any, any> {
  state = {
    name: '',
    description: ''
  }

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    let val = {};
    val[e.currentTarget.name] = e.currentTarget.value.toString();

    this.setState(val);
  }

  createProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post('/project/create', this.state)
      .then(({data}) => {
        if (this.props.onCreateProject) {
          this.props.onCreateProject(data.newProject);
        }
      });
  }

  render() {
    return (
      <form className="form" onSubmit={this.createProject}>
        <p>
          <input className="input" onChange={this.handleChange} type="text" name="name" placeholder="Title" />
        </p>
        <p>
          <input className="input" type="text" onChange={this.handleChange} name="description" placeholder="description" />
        </p>
        <button className="button">create project</button>
      </form>
    );
  }
}

class Project extends Component<any, any> {
  onProjectCreated = (newProject) => {
    this.props.chooseProject(newProject);
  }

  render() {
    if (this.props.store.current_project) {
      return (
        <Redirect to="/" />
      );
    } else {
      return (
        <div>
          <CreateProjectForm onCreateProject={this.onProjectCreated}/>
        </div>
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
    chooseProject: (project) => {
      dispatch({ type: "CHOOSE_PROJECT", payload: project })
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Project);

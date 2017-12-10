import React, { Component } from 'react';
var Song = require('../models/song');
var Alert = require('react-bootstrap').Alert;


class SongEdit extends Component {

  getInitialState() {
      return {song: this.props.song, message: null}
  }

  updateState(attribute, value) {
      var song = this.state.song;
      song[attribute] = value;
      this.setState({song: song});
  }

  handleNameChange(e) {
      this.updateState('name', e.target.value);
  }
  handleActive(e) {
      this.updateState('active', e.target.checked);
  }
  handleURLChange(e) {
      this.updateState('url', e.target.value);
  }
  handleTempoChange(e) {
      this.updateState('tempo', parseInt(e.target.value));
  }
  handleTimeSignatureChange(e) {
      this.updateState('time_signature', e.target.value);
  }
  handleSubmit(e) {
      e.preventDefault();
      var self = this;
      if (this.state.song.id) {
        Song.update(this.state.song).then(function(response) {
            window.location.href = '/rota/songs/'.concat(self.state.song.id);
        });
      } else {
        Song.add(this.state.song).then(function(response) {
            var data = JSON.parse(response.body);
            if (data.response === 'Success') {
              window.location.href = '/rota/songs/'.concat(data.song.id);
            } else {
              self.setState({message: data.message});
            }
        });
      }
  }

  renderTitle() {
    if (this.state.song.id) {
      return ('Edit Song: ' + this.state.song.name);
    } else {
      return ('New Song');
    }
  }

  renderCancelLink() {
    if (this.state.song.id) {
      return (
        <a href={"/rota/songs/".concat(this.state.song.id)}>Cancel</a>
      );
    } else {
      return (
        <a href={"/rota/songs"}>Cancel</a>
      );
    }
  }

  renderAlert() {
    if (this.state.message) {
      return (
        <Alert bsStyle={'danger'} onDismiss={this.handleAlertDismiss}>
          {this.state.message}
        </Alert>
      );
    }
  }

  render() {
    return (
        <div className="container-fluid" role="main">
            <h3 className="sub-heading">
              {this.renderTitle()}
            </h3>

            <div className="panel panel-default">
                <div className="panel-body">
                    {this.renderAlert()}
                    <form role="form">
                      <div className="form-group">
                          <label>Name</label>
                          <input value={this.state.song.name} placeholder="song name"
                                 onChange={this.handleNameChange} className="form-control" />
                      </div>
                      <div className="form-group">
                          <label>Active</label>&nbsp;
                          <input type="checkbox" checked={this.state.song.active}
                                 onChange={this.handleActive} />
                      </div>
                      <div className="form-group">
                          <label>YouTube</label>
                          <input value={this.state.song.url} className="form-control"
                                 placeholder="YouTube Link" onChange={this.handleURLChange} />
                      </div>
                      <div className="form-group">
                          <label>Tempo</label>
                          <input type="number" min="0" max="300" value={this.state.song.tempo} className="form-control"
                                 onChange={this.handleTempoChange} />
                      </div>
                      <div className="form-group">
                          <label>Time Signature</label>
                          <select value={this.state.song.time_signature} className="form-control"
                            onChange={this.handleTimeSignatureChange}>
                              <option value="4/4">4/4</option>
                              <option value="6/8">6/8</option>
                              <option value="3/4">3/4</option>
                              <option value="12/8">12/8</option>
                          </select>
                      </div>
                    </form>
                </div>
                <div className="panel-footer">
                    <button onClick={this.handleSubmit} className="btn btn-primary">Save</button>&nbsp;
                    {this.renderCancelLink()}
                </div>
            </div>
        </div>
    );
  }

}

export default SongEdit;

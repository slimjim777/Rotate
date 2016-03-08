'use strict';
var React = require('react');
var Song = require('../models/song');


var SongEdit = React.createClass({

  getInitialState: function() {
      return {song: this.props.song}
  },

  updateState: function(attribute, value) {
      var song = this.state.song;
      song[attribute] = value;
      this.setState({song: song});
  },

  handleNameChange: function(e) {
      this.updateState('name', e.target.value);
  },
  handleActive: function(e) {
      this.updateState('active', e.target.checked);
  },
  handleURLChange: function(e) {
      this.updateState('url', e.target.value);
  },
  handleTempoChange: function(e) {
      this.updateState('tempo', parseInt(e.target.value));
  },
  handleURLChange: function(e) {
      this.updateState('url', e.target.value);
  },
  handleTimeSignatureChange: function(e) {
      this.updateState('time_signature', e.target.value);
  },
  handleSubmit: function(e) {
      e.preventDefault();
      var self = this;
      Song.update(this.state.song).then(function(response) {
          window.location.href = '/rota/songs/'.concat(self.state.song.id);
      });
  },

  render: function() {
    return (
        <div className="container-fluid" role="main">
            <h3 className="sub-heading">
                Edit Song: {this.state.song.name}
            </h3>

            <div className="panel panel-default">
                <div className="panel-body">
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
                          <input type="number" value={this.state.song.tempo} className="form-control"
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
                    <a href={"/rota/songs/".concat(this.state.song.id)}>Cancel</a>
                </div>
            </div>
        </div>
    );
  }

});

module.exports = SongEdit;

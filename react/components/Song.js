'use strict';
var React = require('react');
var Person = require('../models/person');
var SongModel = require('../models/song');
var Navigation = require('../components/Navigation');
var SongDetail = require('../components/SongDetail');


var Song = React.createClass({

    getInitialState: function() {
        return ({isEditing: false, songId: null, isAdmin: false, song: {}});
    },

    componentDidMount: function () {
      this.getPermissions();

      this.getSong(this.props.params.id);
    },

    getPermissions: function () {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            self.setState({user: user});
        });
    },

    canAdministrate: function() {
      if (!this.state.user) {
          return false;
      }
      if (this.state.user.music_role === 'admin') {
          return true;
      }
      return false;
    },

    getSong: function(songId) {
      var self = this;

      SongModel.findById(songId).then(function(response) {
          var data = JSON.parse(response.body);
          self.setState({song: data.song});
      });
    },

    handleToggleEdit: function(e) {
        e.preventDefault();
        this.setState({isEditing: !this.state.isEditing});
    },

    renderSong: function() {
      if (this.state.isEditing) {
        return (
          <h1>Song Edit: mode not done</h1>
        );
      } else {
        return (
          <SongDetail song={this.state.song} toggleEdit={this.handleToggleEdit}
              canAdministrate={this.canAdministrate()} />
        );
      }
    },

    render: function() {
        var self = this;

        return (
          <div id="main" className="container-fluid" role="main">
              <Navigation active="songs" />
              <h2 className="sub-heading">Song Details</h2>

              {this.renderSong()}
          </div>
        );

    }
});

module.exports = Song;

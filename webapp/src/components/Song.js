import React, { Component } from 'react';
var Person = require('../models/person');
var SongModel = require('../models/song');
var Navigation = require('../components/Navigation');
var SongDetail = require('../components/SongDetail');
var SongEdit = require('../components/SongEdit');


class Song extends Component {

    getInitialState() {
        return ({isEditing: false, songId: null, isAdmin: false, song: {}
          attachments: []
        });
    }

    componentDidMount () {
      this.getPermissions();

      this.getSong(this.props.params.id);
      this.getAttachments(this.props.params.id);
    }

    getPermissions () {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            self.setState({user: user});
        });
    }

    canAdministrate() {
      if (!this.state.user) {
          return false;
      }
      if (this.state.user.music_role === 'admin') {
          return true;
      }
      return false;
    }

    getSong(songId) {
      var self = this;
      if (songId === 'new') {
        this.setState({song: {active: true} isEditing: true});
      } else {
        SongModel.findById(songId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({song: data.song});
        });
      }
    }

    getAttachments(songId) {
      if (songId === 'new') { return };

      var self = this;
      SongModel.attachments(songId).then(function(response) {
          var data = JSON.parse(response.body);
          self.setState({attachments: data.attachments});
      });
    }

    handleRefreshAttachments() {
      this.getAttachments(this.props.params.id);
    }

    handleToggleEdit(e) {
        e.preventDefault();
        this.setState({isEditing: !this.state.isEditing});
    }

    renderSong() {
      if (this.state.isEditing) {
        return (
          <SongEdit song={this.state.song} toggleEdit={this.handleToggleEdit}
              canAdministrate={this.canAdministrate()} />
        );
      } else {
        return (
          <SongDetail song={this.state.song} toggleEdit={this.handleToggleEdit}
              attachments={this.state.attachments}
              refreshAttachments={this.handleRefreshAttachments}
              canAdministrate={this.canAdministrate()} />
        );
      }
    }

    render() {
        var self = this;

        return (
          <div id="main" className="container-fluid" role="main">
              <Navigation active="songs" />
              <h2 className="sub-heading">Song Detail</h2>

              {this.renderSong()}
          </div>
        );

    }
}

export default Song;

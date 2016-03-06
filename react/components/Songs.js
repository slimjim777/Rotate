'use strict';
var React = require('react');
var Navigation = require('../components/Navigation');
var SongList = require('../components/SongList');
var Song = require('../models/song');


var Songs = React.createClass({
  getInitialState: function() {
      return ({songsLoading: false, songs: [], songsFiltered: []});
  },

  componentDidMount: function () {
      var self = this;

      // Get the songs
      self.getSongs();
  },

  getSongs: function() {
      var self = this;
      self.setState({songsLoading: true});
      Song.all().then(function(response) {
          var data = JSON.parse(response.body);
          self.setState({ songs: data.songs, songsLoading: false });
          self.handleFilterChange(null, 'active');
      });
  },

  handleFilterChange: function (name, status) {
      var self = this;
      var songs = this.state.songs.filter(function(p) {
          if (!self.contains(p.name, name)) {
              return false;
          }
          // if ((status === 'active') && (!p.active)) {
          //     return false;
          // }
          return !((status === 'inactive') && (p.active));
      });
      this.setState({songsFiltered: songs});
  },

  render: function () {
    return (
        <div id="main" className="container-fluid" role="main">
            <Navigation active="songs" />
            <h2>Songs</h2>

            <SongList songs={this.state.songs} onFilterChange={this.handleFilterChange} />

        </div>
    );
  }
});

module.exports = Songs;

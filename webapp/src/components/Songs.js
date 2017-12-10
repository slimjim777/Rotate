import React, { Component } from 'react';
import Navigation from './Navigation';
import SongList from './SongList';
import Song from '../models/song';


class Songs extends Component {

  constructor(props) {
      super(props)
      this.state = {songsLoading: false, songs: [], songsFiltered: []};
      
      this.getSongs();
  }

  getSongs() {
      var self = this;
      self.setState({songsLoading: true});
      Song.all().then(function(response) {
          var data = JSON.parse(response.body);
          self.setState({ songs: data.songs, songsLoading: false });
          self.handleFilterChange(null, 'active');
      });
  }

  findSongs(search) {
      var self = this;
      Song.find(search).then(function(response) {
          var data = JSON.parse(response.body);
          self.setState({songs: data.songs});
      });
  }

  canAdministrate() {
    if (!this.props.user.music_role) {
        return false;
    }
    if (this.props.user.music_role === 'admin') {
        return true;
    }
    return false;
  }

  contains(value, snippet) {
      if (!value) {return false;}
      if (!snippet) {return true;}
      return value.toLowerCase().indexOf(snippet.toLowerCase()) >= 0;
  }

  handleFilterChange (name, status) {
      var self = this;
      var songs = this.state.songs.filter(function(p) {
          if (!self.contains(p.name, name)) {
              return false;
          }
          if (status === 'active') {
            return p.active;
          } else if (status === 'inactive') {
            return !p.active;
          } else {
            return true;
          }
      });
      this.setState({songsFiltered: songs});
  }

  renderActions() {
    if (this.canAdministrate()) {
      return (
        <a className="btn btn-primary" href="/rota/songs/new" title="Add new song">
          <span className="glyphicon glyphicon-plus" title="Add new song"></span>
        </a>
      );
    }
  }

  render () {
    console.log(this.props.user)
    if (!this.props.user.music_role) {
        return <div>Loading...</div>
    }
  
    return (
        <div id="main" className="container-fluid" role="main">
            <Navigation active="songs" />
            <h2>Songs {this.renderActions()}</h2>

            <SongList songs={this.state.songsFiltered} onFilterChange={this.handleFilterChange} />

        </div>
    );
  }
}

export default Songs;

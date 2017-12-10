import React, { Component } from 'react';
var SongModel = require('../models/song');


class SetListSongFind extends Component {

  getInitialState() {
    return {search: '', unlisted: '', songs: []};
  }

  handleChangeSearch(e) {
    this.setState({search: e.target.value});
  }

  handleChangeUnlisted(e) {
    this.setState({unlisted: e.target.value});
  }

  handleAddListedSong(e) {
    var songId = parseInt(e.target.getAttribute('data-key'));
    var song = this.state.songs.filter(function(s) {
      return s.id === songId;
    })[0];

    song.song_id = songId
    this.props.addListedSong(song);
  }

  handleAddUnlistedSong() {
    var name;
    if (this.state.unlisted.trim().length > 0) {
      name = this.state.unlisted;
    } else {
      name = 'Untitled';
    }

    var song = {name: name, time_signature: '4/4'};
    this.props.addUnlistedSong(song);
  }

  handleListedKeyUp(e) {
    if (e.keyCode === 13) {
      this.findSongs();
    }
  }

  handleUnlistedKeyUp(e) {
    if (e.keyCode === 13) {
      this.handleAddUnlistedSong();
    }
  }

  findSongs() {
      var self = this;
      SongModel.find(this.state.search).then(function(response) {
          var data = JSON.parse(response.body);
          self.setState({songs: data.songs});
      });
  }

  render() {
    var self = this;

    return (
      <div className="inline-panel">
        <div className="panel panel-info">
          <div className="panel-heading">
            <h3 className="panel-title">Add song to set list</h3>
          </div>
          <div className="panel-body">

              <div className="col-md-6 col-lg-6">
                <div className="input-group">
                  <input type="search" className="form-control" placeholder="find song in library"
                    value={this.state.search} onChange={this.handleChangeSearch} onKeyUp={this.handleListedKeyUp} />
                  <span className="input-group-btn">
                    <button className="btn btn-info" type="button" onClick={this.findSongs}>Find</button>
                  </span>
                </div>
              </div>

              <div className="col-md-6 col-lg-6">
                <div className="input-group">
                  <input className="form-control" placeholder="name of unlisted song"
                    value={this.state.unlisted} onChange={this.handleChangeUnlisted} onKeyUp={this.handleUnlistedKeyUp} />
                  <span className="input-group-btn">
                    <button className="btn btn-info" onClick={this.handleAddUnlistedSong}>Add Unlisted Song</button>
                  </span>
                </div>
              </div>

              <div>
                <button className="btn btn-default-info" onClick={this.props.hideRow}>Close</button>
              </div>
              <div>
                {this.state.songs.map(function(s) {
                  return (
                    <div key={s.id}>
                      <div className="col-sm-5">{s.name}</div>
                      <div className="col-sm-1">
                        <button className="btn btn-info" data-key={s.id} onClick={self.handleAddListedSong}>Add</button>
                      </div>
                    </div>
                  );
                })}
              </div>


          </div>
        </div>
      </div>
    );
  }

}

export default SetListSongFind;

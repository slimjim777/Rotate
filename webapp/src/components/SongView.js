import React, { Component } from 'react';
var Navigation = require('../components/Navigation');
var SongModel = require('../models/song');

var KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];


class SongView extends Component {

  getInitialState() {
    return {song: {} chart: {}};
  }

  componentDidMount() {
    this.getSong(this.props.params.id);
    this.getChart(this.props.params.attachment_id);
  }

  getSong(songId) {
    var self = this;

    SongModel.findById(songId).then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({song: data.song});
    });
  }

  getChart(attachmentId) {
    var self = this;

    SongModel.chart(attachmentId).then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({chart: data.chart});
    });
  }

  handleTranspose(e) {
    var self = this;

    SongModel.transpose(this.props.params.attachment_id, this.state.chart, e.target.textContent).then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({chart: data.chart});
    });
  }

  renderTempo(song) {
    if (song.Tempo) {
      return (
        <div>
            <div className="col-sm-1 col-md-1 col-lg-1">Tempo</div>
            <div className="col-sm-11 col-md-11 col-lg-11">{ song.Tempo }</div>
        </div>
      );
    }
  }

  renderFlow(song) {
    if (song.Flow) {
      var flow = song.Flow.reduce(function(prev, curr) {
        if (prev === '') {
          return curr;
        } else {
          return prev + ', ' + curr;
        }
      } '');

      return (
        <div>
          <div className="col-sm-1 col-md-1 col-lg-1">Flow</div>
          <div className="col-sm-11 col-md-11 col-lg-11">{flow}</div>
        </div>
      );
    }
  }

  renderKey(song) {
    if (song.OriginalKey) {
      return (
        <div>
            <div className="col-sm-1 col-md-1 col-lg-1">Original Key</div>
            <div className="col-sm-11 col-md-11 col-lg-11">{ song.OriginalKey }</div>
        </div>
      );
    }
  }

  renderKeys(song) {
    var self = this;
    return (
      <div>
        <div className="col-sm-1 col-md-1 col-lg-1">Key</div>
        <div className="col-sm-11 col-md-11 col-lg-11">
            <input id="key" type='hidden' name="key" value='Submit form' />
            <div id="key-select" className="btn-group" data-toggle="buttons-radio">
              {
                KEYS.map(function(k) {
                  if (k === song.Key) {
                    return (
                      <button key={k} className='btn btn-primary'>{k}</button>
                    );
                  } else {
                    return (
                      <button key={k} onClick={self.handleTranspose} className='btn btn-default'>{k}</button>
                    );
                  }
                })
              }
            </div>
        </div>
      </div>
    );
  }

  renderSongLyric(chord, lyric, index) {
    return (
      <div key={index} className="cnl">
          <div className="chord">{chord ? chord : ''} &nbsp;</div>
          <div className="lyric">{lyric ? lyric : ''} &nbsp;</div>
      </div>
    );
  }

  renderSong(song) {
    if (!song.display_order) {return};
    var i = 0;
    var self = this;
    return (
      <div className="panel-body">
      {song.display_order.map(function(section) {
        i += 1;
        return (
          <div key={i}>
            <h3>{section}</h3>
            {song[section].map(function(line) {
              i += 1;
              var k = -1;
              return (
                <div key={i} className="cnl_line">
                  {line.lyrics.map(function(lyric) {
                      k += 1;
                      i += 1;
                      return self.renderSongLyric(line.chords[k], line.lyrics[k], i);
                  })}
                </div>
              )
            })}
          </div>
        );
      })}
      </div>
    );
  }

  renderCopyright(song) {
    if ((song.Copyright) && (song.CCLI)) {
      return (
        <div>
          <hr />
          <em>{song.Copyright} (CCLI: {song.CCLI})</em>
        </div>
      );
    } else if (song.Copyright) {
      return (
        <div>
          <hr />
          <em>{song.Copyright}</em>
        </div>
      );
    } else if (song.CCLI) {
      return (
        <div>
          <hr />
          <em>CCLI: {song.CCLI}</em>
        </div>
      );
    };
  }

  render() {
    var song = this.state.chart;
    return (
        <div id="main" className="container-fluid" role="main">
            <Navigation active="songs" />
            <div className="jumbotron">
              <div className="container">
                <h2 className="sub-header">{song.Title}</h2>

                <div>
                    <div>
                        <div className="col-sm-1 col-md-1 col-lg-1">By</div>
                        <div className="col-sm-11 col-md-11 col-lg-11">{song.Artist}</div>
                    </div>
                    {this.renderTempo(song)}
                    {this.renderFlow(song)}
                    {this.renderKey(song)}
                    {this.renderKeys(song)}
                </div>
              </div>
            </div>
            <div className="panel">
              {this.renderSong(song)}
              {this.renderCopyright(song)}
            </div>
        </div>
    );
  }

}

export default SongView;

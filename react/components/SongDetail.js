'use strict';
var React = require('react');


var SongDetail = React.createClass({

  renderActions: function() {
      if (this.props.canAdministrate) {
          return (
              <span>
                  <button className="btn btn-primary" onClick={this.props.toggleEdit}>Edit</button>&nbsp;
                  <button className="btn btn-default" title = "Delete" ><span className="glyphicon glyphicon-remove"></span></button>
              </span>
          );
      }
  },

  renderURL: function(song) {
    if (song.url) {
      return (
        <a href={song.url} className="btn">
          <span className="glyphicon glyphicon-play"></span>
        </a>
      );
    }
  },

  render: function() {

    var song = this.props.song;

    return (
        <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h4 className="sub-heading">
                        {this.renderActions()}{song.name}
                    </h4>
                </div>
                <div className="panel-body">
                    <div>
                        <label>YouTube</label>
                        <div>{song.url} {this.renderURL(song)}</div>
                    </div>
                    <div>
                        <label>Tempo</label>
                        <div>{song.tempo}</div>
                    </div>
                    <div>
                        <label>Time Signature</label>
                        <div>{song.time_signature}</div>
                    </div>
                </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                  <h4 className="sub-heading">Attachments</h4>
              </div>
              <div className="panel-body">
              </div>
            </div>
        </div>
    );
  }

});

module.exports = SongDetail;

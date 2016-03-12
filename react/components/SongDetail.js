'use strict'
var React = require('react');
var relativeDate = require('../models/utils').relativeDate;


var SongDetail = React.createClass({
  handleAttachmentAdd: function(e) {
    e.preventDefault();
  },

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

  renderAttachments: function() {
    var self = this;

    if (this.props.attachments.length > 0) {
      return (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
          {this.props.attachments.map(function(att) {
            return (
              <tr key={att.id}>
                <td>{att.name}</td><td>{relativeDate(att.created_date)}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
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
                <h4 className="sub-heading">
                  <button className="btn btn-secondary" onClick={this.handleAttachmentAdd}>
                    <span className="glyphicon glyphicon-plus"></span>
                  </button>
                  Attachments
                </h4>
              </div>
              <div className="panel-body">
                {this.renderAttachments()}
              </div>
            </div>
        </div>
    );
  }

});

module.exports = SongDetail;

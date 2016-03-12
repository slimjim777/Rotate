'use strict'
var React = require('react');
var relativeDate = require('../models/utils').relativeDate;
var SongAttachment = require('../components/SongAttachment');
var SongModel = require('../models/song');


var SongDetail = React.createClass({
  getInitialState: function() {
    return {showAttachmentAdd: false};
  },

  handleAttachmentAdd: function(e) {
    e.preventDefault();
    this.setState({showAttachmentAdd: !this.state.showAttachmentAdd});
  },

  handleAttachmentAddSave: function(file) {
    var self = this;
    var reader = new FileReader();

    reader.onload = function(upload) {
      SongModel.attachmentAdd(self.props.song.id, file.name, upload.target.result).then(function(response) {
        var data = JSON.parse(response.body);
        self.setState({showAttachmentAdd: false});
        self.props.refreshAttachments();
      });
    }

    reader.readAsDataURL(file);
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

  renderAttachmentAdd: function() {
    if (this.state.showAttachmentAdd) {
      return (
        <SongAttachment onSave={this.handleAttachmentAddSave} onCancel={this.handleAttachmentAdd} />
      )
    }
  },

  attachmentURL: function(path) {
    return FILESTORE_URL + path;
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
                <td><a href={self.attachmentURL(att.path)}>{att.name}</a></td><td>{relativeDate(att.created_date)}</td>
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
                {this.renderAttachmentAdd()}
                {this.renderAttachments()}
              </div>
            </div>
        </div>
    );
  }

});

module.exports = SongDetail;

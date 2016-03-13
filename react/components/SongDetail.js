'use strict'
var React = require('react');
var Alert = require('react-bootstrap').Alert;
var relativeDate = require('../models/utils').relativeDate;
var SongAttachment = require('../components/SongAttachment');
var SongModel = require('../models/song');


var SongDetail = React.createClass({
  getInitialState: function() {
    return {showAttachmentAdd: false, message: null, messageType: null};
  },

  handleAttachmentAdd: function(e) {
    e.preventDefault();
    this.setState({showAttachmentAdd: !this.state.showAttachmentAdd, message: null, messageType: null});
  },

  handleAttachmentAddSave: function(file) {
    var self = this;
    var reader = new FileReader();

    reader.onload = function(upload) {
      SongModel.attachmentAdd(self.props.song.id, file.name, upload.target.result).then(function(response) {
        var data = JSON.parse(response.body);
        if (data.response === 'Success') {
          self.setState({showAttachmentAdd: false, message: "Attachment added successfully", messageType: "success"});
          self.props.refreshAttachments();
        } else {
          self.setState({message: data.message, messageType: "danger"});
        }
      });
    }

    reader.readAsDataURL(file);
  },

  handleAttachmentDelete: function(e) {
    var self = this;

    var attId = parseInt(e.target.getAttribute('data-key'));
    SongModel.attachmentDelete(this.props.song.id, attId).then(function(response) {
      var data = JSON.parse(response.body);
      if (data.response === 'Success') {
        self.setState({message: "Attachment removed successfully", messageType: "success"});
        self.props.refreshAttachments();
      } else {
        self.setState({message: data.message, messageType: "danger"});
      }
    });
  },

  handleAlertDismiss: function() {
    this.setState({message: null, messageType: null});
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
              <th>Name</th><th>Created</th><th></th>
            </tr>
          </thead>
          <tbody>
          {this.props.attachments.map(function(att) {
            return (
              <tr key={att.id}>
                <td><a href={self.attachmentURL(att.path)}>{att.name}</a></td><td>{relativeDate(att.created_date)}</td>
                {self.renderAttachmentDeleteButton(att)}
              </tr>
            );
          })}
          </tbody>
        </table>
      );
    }
  },

  renderAttachmentAddButton: function() {
    if (this.props.canAdministrate) {
      return (
        <button className="btn btn-secondary" onClick={this.handleAttachmentAdd}>
          <span className="glyphicon glyphicon-plus"></span>
        </button>
      );
    }
  },

  renderAttachmentDeleteButton: function(att) {
    if (this.props.canAdministrate) {
      return (
        <td>
          <button className="btn btn-default" data-key={att.id} onClick={this.handleAttachmentDelete}>
            <span className="glyphicon glyphicon-remove" data-key={att.id}></span>
          </button>
        </td>
      );
    }
  },

  renderAlert: function() {
    if (this.state.message) {
      return (
        <Alert bsStyle={this.state.messageType} onDismiss={this.handleAlertDismiss}
          dismissAfter={5000}>{this.state.message}</Alert>
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
                  {this.renderAttachmentAddButton()}
                  Attachments
                </h4>
              </div>
              <div className="panel-body">
                {this.renderAlert()}
                {this.renderAttachmentAdd()}
                {this.renderAttachments()}
              </div>
            </div>
        </div>
    );
  }

});

module.exports = SongDetail;

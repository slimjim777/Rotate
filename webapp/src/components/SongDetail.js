import React, { Component } from 'react';
import {Alert} from 'react-bootstrap';
import {relativeDate} from '../models/utils';
import SongAttachment from '../components/SongAttachment';
import SongModel from '../models/song';


class SongDetail extends Component {

  constructor(props) {
      super(props)
      this.state = {showAttachmentAdd: false, message: null, messageType: null};
  }

  handleAttachmentAdd(e) {
    e.preventDefault();
    this.setState({showAttachmentAdd: !this.state.showAttachmentAdd, message: null, messageType: null});
  }

  handleAttachmentAddSave(file) {
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
  }

  handleAttachmentDelete(e) {
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
  }

  handleAlertDismiss() {
    this.setState({message: null, messageType: null});
  }

  renderActions() {
      if (this.props.canAdministrate) {
          return (
              <span>
                  <button className="btn btn-primary" onClick={this.props.toggleEdit}>Edit</button>&nbsp;
              </span>
          );
      }
  }

  renderURL(song) {
    if (song.url) {
      return (
        <a href={song.url} className="btn">
          <span className="glyphicon glyphicon-play"></span>
        </a>
      );
    }
  }

  renderAttachmentAdd() {
    if (this.state.showAttachmentAdd) {
      return (
        <SongAttachment onSave={this.handleAttachmentAddSave} onCancel={this.handleAttachmentAdd} />
      )
    }
  }

  attachmentURL(path) {
    return FILESTORE_URL + path;
  }

  onsongDownload(att) {
    if (att.path.slice(-6) === 'onsong') {
      var url = FILESTORE_URL.replace('http:', 'onsong:') + att.path;
      return (
        <span>
          &nbsp;
          <a href={url} download title="OnSong import - start the app first" className="btn btn-default"><span className="glyphicon glyphicon-phone"></span></a>
        </span>
      );
    }
  }

  chartView(att) {
    if ((att.path.slice(-6) === 'onsong') || (att.path.slice(-3) === 'pro')) {
      var url = '/rota/songs/'.concat(att.song_id, '/attachments/', att.id);
      return (
        <span>
          &nbsp;
          <a href={url} title="Song Chart" className="btn btn-default">Chart</a>
        </span>
      );
    }
  }

  renderAttachments() {
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
                <td>
                  <a href={self.attachmentURL(att.path)}>{att.name}</a>
                  &nbsp;<a href={self.attachmentURL(att.path)} download title="Download File" className="btn btn-default"><span className="glyphicon glyphicon-download-alt"></span></a>
                  {self.onsongDownload(att)}
                  {self.chartView(att)}
                </td>
                <td>{relativeDate(att.created_date)}</td>
                {self.renderAttachmentDeleteButton(att)}
              </tr>
            );
          })}
          </tbody>
        </table>
      );
    }
  }

  renderAttachmentAddButton() {
    if (this.props.canAdministrate) {
      return (
        <button className="btn btn-secondary" onClick={this.handleAttachmentAdd}>
          <span className="glyphicon glyphicon-plus"></span>
        </button>
      );
    }
  }

  renderAttachmentDeleteButton(att) {
    if (this.props.canAdministrate) {
      return (
        <td>
          <button className="btn btn-default" data-key={att.id} onClick={this.handleAttachmentDelete}>
            <span className="glyphicon glyphicon-remove" data-key={att.id}></span>
          </button>
        </td>
      );
    }
  }

  renderAlert() {
    if (this.state.message) {
      return (
        <Alert bsStyle={this.state.messageType} onDismiss={this.handleAlertDismiss}
          dismissAfter={5000}>{this.state.message}</Alert>
      );
    }
  }

  render() {

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

}

export default SongDetail;

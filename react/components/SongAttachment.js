'use strict'
var React = require('react');
var Dropzone = require('react-dropzone');
var filesize = require('filesize');


var SongAttachment = React.createClass({
  getInitialState: function() {
    return {file: {}};
  },

  handleDrop: function(files) {
    console.log('Received files: ', files);
  },

  handleDropAccepted: function(files) {
    console.log('Accepted files: ', files);
    var f = files[0];
    this.setState({file: f});
  },

  handleSaveClick: function(e) {
    e.preventDefault();
    this.props.onSave(this.state.file);
  },

  render: function() {
    return (
      <div>
        <div className="col-xs-4">
          <Dropzone onDrop={this.handleDrop} onDropAccepted={this.handleDropAccepted}
              multiple={false} accept={'application/pdf,text/*,audio/*'}>
            <div>Drop a file here, or click to select a file to upload.</div>
          </Dropzone>
        </div>
        <div className="col-xs-8">
          <table className="table left">
            <tbody>
              <tr>
                <td>Filename:</td><td>{this.state.file.name}</td>
              </tr>
              <tr>
                <td>Type:</td><td>{this.state.file.type}</td>
              </tr>
              <tr>
                <td>Size:</td><td>{this.state.file.size ? filesize(this.state.file.size) : ''}</td>
              </tr>
            </tbody>
          </table>
          <div>
            <button onClick={this.handleSaveClick} className="btn btn-primary">Save</button>
            <button onClick={this.props.onCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SongAttachment;

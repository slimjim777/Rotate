'use strict'
var React = require('react');
var SetListSongFind = require('../components/SetListSongFind');
var Alert = require('react-bootstrap').Alert;
var Utils = require('../models/utils');


var SetListDetail = React.createClass({
  getInitialState: function() {
    return {showRow: false, showRowFind: false, isEditing: false, editRows: [], editRow: null, message: null, messageType: 'info'};
  },

  handleChangeRowField: function(field, value) {
    var self = this;

    var rows = this.state.editRows;
    var rowIndex = rows.findIndex(function(r) {
      return r.id === self.state.editRow;
    });

    rows[rowIndex][field] = value;
    this.setState({editRows: rows});
  },
  handleChangeRowName: function(e) {
    this.handleChangeRowField('name', e.target.value);
  },
  handleChangeRowTempo: function(e) {
    this.handleChangeRowField('tempo', e.target.value);
  },
  handleChangeRowTime: function(e) {
    this.handleChangeRowField('time_signature', e.target.value);
  },
  handleChangeRowURL: function(e) {
    this.handleChangeRowField('url', e.target.value);
  },
  handleChangeRowNotes: function(e) {
    this.handleChangeRowField('notes', e.target.value);
  },


  handleAddRow: function(e) {
    this.setState({showRowFind: true, showRow: false, isEditing: false, editRow: null});
  },

  handleHideRow: function() {
    this.setState({showRowFind: false});
  },

  handleAddListedSong: function(song) {
    var self = this;
    var setlist = this.props.setlist;
    setlist.rows.push(song);

    this.props.updateSetList(setlist).then(function(response) {
      self.props.refreshSetList();
    });
  },

  handleAddUnlistedSong: function(song) {
    var self = this;
    var setlist = this.props.setlist;
    setlist.rows.push(song);

    this.props.updateSetList(setlist).then(function(response) {
      self.props.refreshSetList();
    });
  },

  handleToggleEdit: function() {
    var editRow = null;
    if (this.props.setlist.rows.length > 0) {
      editRow = this.props.setlist.rows[0].id;
    }

    var isEditing = !this.state.isEditing;

    this.setState({isEditing: isEditing, editRow: editRow, editRows: this.props.setlist.rows});
    if (!isEditing) {
      this.props.refreshSetList();
    }
  },

  handleEditRowSelect: function(e) {
    this.setState({editRow: parseInt(e.target.value)});
  },

  handleEditSave: function() {
    // Check that the names are entered for all rows
    var self = this;
    var error = false;
    this.state.editRows.map(function(r) {
      if (r.name.trim().length === 0) {
        error = true;
      }
    });
    if (error) {
      this.setState({messageType: 'danger', message: 'The song name must be entered for all songs'});
      return;
    }

    var setlist = this.props.setlist;
    setlist.rows = this.state.editRows;
    this.props.updateSetList(setlist).then(function(response) {
      self.handleToggleEdit();
      self.props.refreshSetList();
    });
  },

  handleAlertDismiss: function() {
    this.setState({message: null, messageType: null});
  },

  getRowIndex: function() {
    var self = this;
    var rows = this.state.editRows;
    var rowIndex = rows.findIndex(function(r) {
      return r.id === self.state.editRow;
    });
    return rowIndex;
  },

  handleDeleteRow: function(e) {
    var self = this;
    var rows = this.state.editRows;
    var rowIndex = rows.findIndex(function(r) {
      return r.id === self.state.editRow;
    });

    rows.splice(rowIndex, 1);
    this.setState({editRows: rows});
  },

  handleMoveUp: function(e) {
    var rowIndex = this.getRowIndex();
    var rows = this.state.editRows;

    if (rowIndex > 0) {
      // Swap items n and n-1
      rows = Utils.arraySwap(rows, rowIndex-1, rowIndex);
      this.setState({editRows: rows});
    }
  },

  handleMoveDown: function(e) {
    var rowIndex = this.getRowIndex();
    var rows = this.state.editRows;

    if (rowIndex < rows.length-1) {
      // Swap items n and n+1
      rows = Utils.arraySwap(rows, rowIndex, rowIndex+1);
      this.setState({editRows: rows});
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

  renderRows: function() {
    var self = this;
    if (this.state.isEditing) {
      return this.state.editRows.map(function(r) {
        return self.renderRowViewOrEdit(r);
      });
    } else {
      return this.props.setlist.rows.map(function(r) {
        return self.renderRowViewOrEdit(r);
      });
    }
  },

  renderRowIsEditing: function(row, rowIndex, checked) {
    if (this.state.isEditing) {
      return (
        <td>
          <input type="radio" name="editrow" value={rowIndex} onChange={this.handleEditRowSelect} checked={checked} />
        </td>
      );
    }
  },

  renderNameLink: function(row) {
    if (row.song_id) {
      return (
        <a href={'/rota/songs/' + row.song_id}>{row.name}</a>
      );
    } else {
      return row.name;
    }
  },

  renderNameLinkEdit: function(row) {
    if (row.song_id) {
      return (
        <a href={'/rota/songs/' + row.song_id}>{row.name}</a>
      );
    } else {
      return (
        <input value={row.name} onChange={this.handleChangeRowName} placeholder="name" className="form-control" />
      );
    }
  },

  renderURL: function(song) {
    if (song.url) {
      return (
        <a href={song.url} className="btn btn-default">
          <span className="glyphicon glyphicon-play"></span>
        </a>
      );
    }
  },

  renderRowViewOrEdit: function(r) {
    var self = this;

    if ((this.state.isEditing) && (r.id===this.state.editRow)) {
      return (
        <tr key={r.id}>
          {this.renderRowIsEditing(r, r.id, true)}
          <td>{this.renderNameLinkEdit(r)}</td>
          <td><input value={r.key} onChange={this.handleChangeRowKey} placeholder="key" className="form-control" /></td>
          <td><input type="number" min="0" max="300" value={r.tempo} onChange={this.handleChangeRowTempo} placeholder="tempo" className="form-control" /></td>
          <td>
            <select value={r.time_signature} onChange={this.handleChangeRowTime} placeholder="time signature" className="form-control">
              <option>4/4</option>
              <option>6/8</option>
              <option>3/4</option>
              <option>12/8</option>
            </select>
          </td>
          <td><input value={r.url} onChange={this.handleChangeRowURL} placeholder="url" className="form-control" /></td>
          <td><textarea value={r.notes} onChange={this.handleChangeRowNotes} placeholder="notes" className="form-control" /></td>
        </tr>
      );
    } else {
      return (
        <tr key={r.id}>
          {this.renderRowIsEditing(r, r.id, false)}
          <td>{this.renderNameLink(r)}</td>
          <td>{r.key}</td>
          <td>{r.tempo}</td>
          <td>{r.time_signature}</td>
          <td>{this.renderURL(r)}</td>
          <td>{Utils.renderMultiLine(r.notes)}</td>
        </tr>
      );
    }
  },

  renderRowFind: function() {
    if (this.state.showRowFind) {
      return (
        <SetListSongFind addListedSong={this.handleAddListedSong} addUnlistedSong={this.handleAddUnlistedSong}
          hideRow={this.handleHideRow} />
      );
    }
  },

  renderTableHeadingIsEditing: function() {
    if (this.state.isEditing) {
      return <th>Select</th>;
    }
  },

  renderRowButtons: function() {
    if (this.state.isEditing) {
      return (
        <tr>
          <td colSpan="5">
            <span>
                <button className="btn" onClick={this.handleEditSave} title="Save all changes to runsheet">Save</button>&nbsp;
                <button className="btn btn-default" onClick={this.handleToggleEdit} title="Cancel all changes to runsheet">Cancel</button>
                &nbsp;
                <button className="btn btn-default" onClick={this.handleMoveUp} title="Move selected row up">
                  <span className="glyphicon glyphicon-arrow-up"></span>
                </button>
                <button className="btn btn-default" onClick={this.handleMoveDown} title="Move selected row down">
                  <span className="glyphicon glyphicon-arrow-down"></span>
                </button>
                <button className="btn btn-danger" onClick={this.handleDeleteRow} title="Remove selected row">
                  <span className="glyphicon glyphicon-remove"></span>
                </button>
            </span>
          </td>
        </tr>
      );
    }
  },

  // Only display the edit row button if we have rows to edit
  renderActionEdit: function() {
    if ((this.props.setlist.rows) && (this.props.setlist.rows.length > 0)) {
      return (
        <button className="btn btn-default" title="Edit Row Mode" onClick={this.handleToggleEdit}>
          <span className="glyphicon glyphicon-edit" onClick={this.handleToggleEdit}></span>
        </button>
      );
    }
  },

  renderActions: function() {
    if (this.props.canAdministrate) {
      return (
        <span>
            &nbsp;
            <button className="btn btn-default" title="Add Row" onClick={this.handleAddRow}>
              <span className="glyphicon glyphicon-plus" onClick={this.handleAddRow}></span>
            </button>
            {this.renderActionEdit()}
        </span>
      );
    }
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4>Set List&nbsp;
            {this.renderActions()}
          </h4>
        </div>

        {this.renderRowFind()}
        {this.renderAlert()}

        <div className="panel-body">
          <table className="table table-responsive">
            <thead>
              <tr>
                {this.renderTableHeadingIsEditing()}
                <th className="col-sm-4">Name</th>
                <th className="col-sm-1">Key</th>
                <th className="col-sm-1">Tempo</th><th className="col-sm-1">Time Signature</th><th className="col-sm-1">YouTube</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {this.renderRows()}
              {this.renderRowButtons()}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

});

module.exports = SetListDetail;

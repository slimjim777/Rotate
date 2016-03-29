'use strict';
var React = require('react');
var moment = require('moment');


var RunsheetDetail = React.createClass({
  getInitialState: function() {
    return {showRow: false, isEditing: false, row: {duration:0}, editRow: 0};
  },

  handleToggleEdit: function() {
    this.setState({isEditing: !this.state.isEditing, editRow: 0, showRow: false});
    this.props.refreshRunsheet();
  },

  handleAddRow: function(e) {
    this.setState({showRow: true, isEditing: false, editRow: 0,});
  },

  handleChangeRowField: function(field, value) {
    if (this.state.isEditing) {
      this.props.changeRowField(this.state.editRow, field, value);
    } else {
      var row = this.state.row;
      row[field] = value;
      this.setState({row: row});
    }
  },

  handleChangeRowDuration: function(e) {
    this.handleChangeRowField('duration', parseInt(e.target.value));
  },

  handleChangeRowItem: function(e) {
    this.handleChangeRowField('item', e.target.value);
  },

  handleChangeRowDetails: function(e) {
    this.handleChangeRowField('details', e.target.value);
  },

  handleChangeRowNotes: function(e) {
    this.handleChangeRowField('notes', e.target.value);
  },

  handleAddSave: function() {
    var self = this;
    var sheet = this.props.sheet;
    sheet.rows.push({
      duration: parseInt(this.state.row.duration),
      item: this.state.row.item,
      details: this.state.row.details,
      notes: this.state.row.notes
    });
    var endTime = this.calcEndTime(sheet.rows);
    sheet.end = endTime;

    this.props.updateRunsheet(sheet).then(function(response) {
      self.setState({row: {duration:0, details:'', notes:''}});
      self.props.refreshRunsheet();
    });
  },

  handleAddCancel: function() {
    this.props.refreshRunsheet();
    this.setState({showRow: false});
  },

  handleEditRowSelect: function(e) {
    this.setState({editRow: parseInt(e.target.value)});
  },

  handleEditSave: function() {
    var self = this;
    var sheet = this.props.sheet;
    var endTime = this.calcEndTime(sheet.rows);
    sheet.end = endTime;

    this.props.updateRunsheet(sheet).then(function(response) {
      self.setState({isEditing: false, editRow: 0, row: {duration:0, details:'', notes:''}});
      self.props.refreshRunsheet();
    });
  },

  handleDeleteRow: function() {
    this.props.deleteRow(this.state.editRow);
  },

  handleMoveUp: function() {
    var index = this.props.moveUp(this.state.editRow);
    this.setState({editRow: index});
  },

  handleMoveDown: function() {
    var index = this.props.moveDown(this.state.editRow);
    this.setState({editRow: index});
  },

  handleChangeStartHour: function(e) {
    var sheet = this.props.sheet
    var min = sheet.start.split(':')[1];
    var start = this.leftPadZero(e.target.value) + ':' + min;
    this.props.setStartTime(start);
  },
  handleChangeStartMinute: function(e) {
    var sheet = this.props.sheet
    var hour = sheet.start.split(':')[0];
    var start = hour + ':' + this.leftPadZero(e.target.value);
    this.props.setStartTime(start);
  },

  leftPadZero: function(n) {
    return ('00'+n).slice(-2);
  },

  calcEndTime: function(rows) {
    // Calculate the total
    var totalDuration = 0;
    rows.map(function(curr) {
      totalDuration += curr.duration;
    });
    var start = this.startTime();
    var endTime = start.add(totalDuration, 'minutes').format('HH:mm');
    return endTime;
  },

  startTime: function() {
    var currentTime = moment();
    var start = this.props.sheet.start.split(':');
    currentTime.set('hour', start[0]);
    currentTime.set('minute', start[1]);
    currentTime.set('second', 0);
    return currentTime;
  },

  renderRowNew: function() {
    if (this.state.showRow) {
      return (
        <tr>
          <td></td>
          <td><input type="number" min="0" max="1440" value={this.state.row.duration} onChange={this.handleChangeRowDuration} placeholder="length" /></td>
          <td><input value={this.state.row.item} onChange={this.handleChangeRowItem} placeholder="item" /></td>
          <td><textarea value={this.state.row.details} onChange={this.handleChangeRowDetails} placeholder="details" className="form-control" /></td>
          <td><textarea value={this.state.row.notes} onChange={this.handleChangeRowNotes} placeholder="notes" className="form-control" /></td>
        </tr>
      );
    }
  },

  renderRowButtons: function() {
    if (this.state.showRow) {
      return (
        <tr>
          <td colSpan="5">
            <span>
                <button className="btn" onClick={this.handleAddSave}>Save</button>&nbsp;
                <button className="btn btn-default" onClick={this.handleAddCancel}>Close</button>
            </span>
          </td>
        </tr>
      );
    }
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
    if (this.props.sheet.rows.length > 0) {
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

  renderRowIsEditing: function(row, rowIndex, checked) {
    if (this.state.isEditing) {
      return (
        <td>
          <input type="radio" name="editrow" value={rowIndex} onChange={this.handleEditRowSelect} checked={checked} />
        </td>
      );
    }
  },

  renderTableHeadingIsEditing: function() {
    if (this.state.isEditing) {
      return <th>Select</th>;
    }
  },

  renderRowViewOrEdit: function(r, rowIndex, start) {
    if ((this.state.isEditing) && (rowIndex===this.state.editRow)) {
      return (
        <tr key={rowIndex}>
          {this.renderRowIsEditing(r, rowIndex, true)}
          <td>{start}</td>
          <td><input type="number" min="0" max="1440" value={r.duration} onChange={this.handleChangeRowDuration} placeholder="length" /></td>
          <td><input value={r.item} onChange={this.handleChangeRowItem} placeholder="item" /></td>
          <td><textarea value={r.details} onChange={this.handleChangeRowDetails} placeholder="details" className="form-control" /></td>
          <td><textarea value={r.notes} onChange={this.handleChangeRowNotes} placeholder="notes" className="form-control" /></td>
        </tr>
      );
    } else {
      return (
        <tr key={rowIndex}>
          {this.renderRowIsEditing(r, rowIndex, false)}
          <td>{start}</td>
          <td>{r.duration}</td>
          <td>{r.item}</td>
          <td>{r.details}</td>
          <td>{r.notes}</td>
        </tr>
      );
    }
  },

  renderRows: function() {
    var self = this;
    var rowIndex = -1;
    var currentTime = this.startTime();

    return this.props.sheet.rows.map(function(r) {
      rowIndex += 1;
      var start = currentTime.format('HH:mm');
      currentTime.add(r.duration, 'minutes');
      return self.renderRowViewOrEdit(r, rowIndex, start);
    });
  },

  renderHeading: function() {
    if (this.props.sheet.rows.length > 0) {
      return 'Run Sheet (' + this.props.sheet.start + ' - ' + this.props.sheet.end + ')';
    } else {
      return 'Run Sheet';
    }
  },

  renderStartTime: function() {
    var sheet = this.props.sheet;

    if ((this.state.isEditing) || (this.state.showRow)) {
      var hour = sheet.start.split(':')[0];
      var min = sheet.start.split(':')[1];
      return (
        <div>
          <label>Start Time</label>
          <div>
            <input type="number" min="0" max="23" value={hour} onChange={this.handleChangeStartHour} />
            :
            <input type="number" min="0" max="59" value={min} onChange={this.handleChangeStartMinute} />
          </div>
        </div>
      );
    }
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4>{this.renderHeading()}
            {this.renderActions()}
          </h4>
        </div>
        <div className="panel-body">
          {this.renderStartTime()}
          <table className="table table-responsive">
            <thead>
              <tr>
                {this.renderTableHeadingIsEditing()}
                <th className="col-sm-1">Time</th><th className="col-sm-1">Length</th>
                <th className="col-sm-4">Item</th><th className="col-sm-2">Details</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {this.renderRows()}
              {this.renderRowNew()}
              {this.renderRowButtons()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = RunsheetDetail;

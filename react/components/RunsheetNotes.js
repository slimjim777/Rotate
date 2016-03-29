'use strict';
var React = require('react');


var RunsheetNotes = React.createClass({
  getInitialState: function() {
    return {isAdding: false, isEditing: false, row: {}, editRow: 0};
  },

  handleAddRow: function() {
    this.setState({isAdding: true, isEditing: false, editRow: 0,});
  },

  handleAddCancel: function() {
    this.props.refreshRunsheet();
    this.setState({isAdding: false});
  },

  handleToggleEdit: function() {
    this.setState({isEditing: !this.state.isEditing, editRow: 0, isAdding: false});
    this.props.refreshRunsheet();
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

  handleChangeRowSection: function(e) {
    this.handleChangeRowField('section', e.target.value);
  },

  handleChangeRowDetails: function(e) {
    this.handleChangeRowField('details', e.target.value);
  },

  handleEditRowSelect: function(e) {
    this.setState({editRow: parseInt(e.target.value)});
  },

  handleAddSave: function() {
    var self = this;
    var notes = this.props.notes;
    notes.rows.push({
      section: this.state.row.section,
      details: this.state.row.details
    });

    this.props.updateRunsheet(notes).then(function(response) {
      self.setState({row: {section:'', details:''}});
      self.props.refreshRunsheet();
    });
  },

  handleEditSave: function() {
    var self = this;
    var notes = this.props.notes;

    this.props.updateRunsheet(notes).then(function(response) {
      self.setState({isEditing: false, editRow: 0, row: {section: '', details:''}});
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

  renderRowIsEditing: function(row, rowIndex, checked) {
    if (this.state.isEditing) {
      return (
        <td>
          <input type="radio" name="editrow" value={rowIndex} onChange={this.handleEditRowSelect} checked={checked} />
        </td>
      );
    }
  },

  renderMultiLine: function(notes) {
    if (notes) {
      var i = 0;
      return notes.split('\n').map(function(item) {
        i += 1;
        return (
          <span key={i}>{item}<br /></span>
        );
      });
    }
  },

  renderRows: function() {
    var self = this;
    var rowIndex = -1;

    return this.props.notes.rows.map(function(r) {
      rowIndex += 1;

      if ((self.state.isEditing) && (rowIndex===self.state.editRow)) {
        return (
          <tr key={rowIndex}>
            {self.renderRowIsEditing(r, rowIndex, true)}
            <td><textarea value={r.section} onChange={self.handleChangeRowSection} placeholder="section" className="form-control" /></td>
            <td><textarea value={r.details} onChange={self.handleChangeRowDetails} placeholder="details" className="form-control" /></td>
          </tr>
        );
      } else {
        return (
          <tr key={rowIndex}>
            {self.renderRowIsEditing(r, rowIndex, false)}
            <td>{r.section}</td>
            <td>{self.renderMultiLine(r.details)}</td>
          </tr>
        );
      }
    });
  },

  renderTableHeadingIsEditing: function() {
    if (this.state.isEditing) {
      return <th>Select</th>;
    }
  },

  // Only display the edit row button if we have rows to edit
  renderActionEdit: function() {
    if (this.props.notes.rows.length > 0) {
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

  renderRowNew: function() {
    if (this.state.isAdding) {
      return (
        <tr>
          <td><textarea value={this.state.row.section} onChange={this.handleChangeRowSection} placeholder="section" className="form-control" /></td>
          <td><textarea value={this.state.row.details} onChange={this.handleChangeRowDetails} placeholder="details" className="form-control" /></td>
        </tr>
      );
    }
  },

  renderRowButtons: function() {
    if (this.state.isAdding) {
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

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h4>Notes {this.renderActions()}</h4>
        </div>
        <div className="panel-body">
          <table className="table table-responsive">
            <thead>
              <tr>
                {this.renderTableHeadingIsEditing()}
                <th className="col-sm-3"></th><th></th>
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

module.exports = RunsheetNotes;

'use strict'
var React = require('react');
var moment = require('moment');
var Navigation = require('../components/Navigation');
var EventModel = require('../models/event');
var RunsheetDetail = require('../components/RunsheetDetail');
var RunsheetNotes = require('../components/RunsheetNotes');
var RunsheetEvents = require('../components/RunsheetEvents');
var Person = require('../models/person');
var Utils = require('../models/utils');

var DEFAULT_DETAIL = {start: '09:00', rows: []};
var DEFAULT_NOTES = {rows: []};

var Runsheet = React.createClass({
    getInitialState: function() {
      return {sheet: {}, detail: DEFAULT_DETAIL, notes: DEFAULT_NOTES, import: false,
        templates: [], templateId: null};
    },

    componentDidMount: function() {
      this.getRunsheet(this.props.params.id, this.props.params.onDate);

      // Get the user permissions
      this.getPermissions(this.props.params.id);

      this.getEventTemplates();
    },

    getRunsheet: function(eventId, onDate) {
      var self = this;
      EventModel.runsheet(eventId, onDate).then(function(response) {
        var data = JSON.parse(response.body);
        if (data.response === 'Success') {
          var detail;
          var notes;
          if (data.runsheet.runsheet) {
            detail = JSON.parse(data.runsheet.runsheet);
          } else {
            detail = DEFAULT_DETAIL;
          }
          if (data.runsheet.runsheet_notes) {
            notes = JSON.parse(data.runsheet.runsheet_notes);
          } else {
            notes = DEFAULT_NOTES;
          }
          self.setState({sheet: data.runsheet, detail: detail, notes: notes, import: false});
        } else {
          self.setState({sheet: {}, detail: DEFAULT_DETAIL, notes: DEFAULT_NOTES, import: false});
        }
      });
    },

    getEventTemplates: function() {
      var self = this;
      EventModel.runsheetTemplatesForEvent(this.props.params.id).then(function(response) {
        var data = JSON.parse(response.body);
        self.setState({templates: data.templates});
      })
    },

    getPermissions: function (eventId) {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body);
            self.setState({user: user.permissions, canAdministrate: self.setCanAdministrate(eventId, user.permissions)});
        });
    },

    // Callbacks for the run sheet details
    detailRefreshRunsheet: function() {
      this.getRunsheet(this.props.params.id, this.props.params.onDate);
    },

    detailUpdateRunsheet: function(detail) {
      return EventModel.updateRunsheet(this.props.params.id, this.props.params.onDate, detail);
    },

    detailDeleteRow: function(rowIndex) {
      var self = this;
      var detail = this.state.detail;
      detail.rows.splice(rowIndex, 1);
      this.setState({detail: detail});
    },

    detailMoveDown: function(rowIndex) {
      var detail = this.state.detail;
      if (rowIndex < detail.rows.length-1) {
        // Swap items n and n+1
        detail.rows = Utils.arraySwap(detail.rows, rowIndex, rowIndex+1);
        this.setState({detail: detail});
        return rowIndex+1;
      } else {
        return rowIndex;
      }
    },

    detailMoveUp: function(rowIndex) {
      if (rowIndex > 0) {
        // Swap items n and n-1
        var detail = this.state.detail;
        detail.rows = Utils.arraySwap(detail.rows, rowIndex-1, rowIndex);
        this.setState({detail: detail});
        return rowIndex-1;
      } else {
        return rowIndex;
      }
    },

    detailChangeRowField: function(rowIndex, field, value) {
      var detail = this.state.detail;
      detail.rows[rowIndex][field] = value;
      this.setState({detail: detail});
    },

    detailSetStartTime: function(start) {
      var detail = this.state.detail;
      detail.start = start;
      this.setState({detail: detail});
    },

    // Callbacks for the run sheet notes
    notesRefreshRunsheet: function() {
      this.getRunsheet(this.props.params.id, this.props.params.onDate);
    },

    notesUpdateRunsheet: function(notes) {
      return EventModel.updateRunsheetNotes(this.props.params.id, this.props.params.onDate, notes);
    },

    notesDeleteRow: function(rowIndex) {
      var self = this;
      var notes = this.state.notes;
      notes.rows.splice(rowIndex, 1);
      this.setState({notes: notes});
    },

    notesMoveDown: function(rowIndex) {
      var notes = this.state.notes;
      if (rowIndex < notes.rows.length-1) {
        // Swap items n and n+1
        notes.rows = Utils.arraySwap(notes.rows, rowIndex, rowIndex+1);
        this.setState({notes: notes});
        return rowIndex+1;
      } else {
        return rowIndex;
      }
    },

    notesMoveUp: function(rowIndex) {
      if (rowIndex > 0) {
        // Swap items n and n-1
        var notes = this.state.notes;
        notes.rows = Utils.arraySwap(notes.rows, rowIndex-1, rowIndex);
        this.setState({notes: notes});
        return rowIndex-1;
      } else {
        return rowIndex;
      }
    },

    notesChangeRowField: function(rowIndex, field, value) {
      var notes = this.state.notes;
      notes.rows[rowIndex][field] = value;
      this.setState({notes: notes});
    },

    setCanAdministrate: function(eventId, user) {
        if (user.role == 'admin') {
            return true;
        } else {
            var events = user.events_admins.filter(function(permission) {
                return permission.id === eventId;
            });
            if (events.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    },

    handleChangeTemplate: function(e) {
      this.setState({templateId: parseInt(e.target.value)});
    },

    handleImportToggle: function() {
      this.setState({import: !this.state.import});
    },

    handleImportTemplate: function() {
      var templateId = this.state.templateId;
      if (!templateId) { return };

      // Get the template details
      var template = this.state.templates.filter(function(t) {
        return t.id === templateId;
      })[0];

      var runsheet = DEFAULT_DETAIL;
      if (template.runsheet) {
        runsheet = JSON.parse(template.runsheet);
      }
      var runsheet_notes = DEFAULT_NOTES;
      if (template.notes) {
        runsheet_notes = JSON.parse(template.notes);
      }

      this.detailUpdateRunsheet(runsheet);
      this.notesUpdateRunsheet(runsheet_notes);
      this.getRunsheet(this.props.params.id, this.props.params.onDate);
    },

    renderRunSheetLink: function(sheet) {
        if (sheet.url) {
            return (
                <a href={sheet.url}>
                    external link for {moment(sheet.on_date).format('DD/MM/YYYY')}
                </a>
            );
        }
    },

    renderRunSheet: function(sheet) {
      if (sheet.event_id) {
        return (
          <RunsheetDetail summary={sheet} sheet={this.state.detail} canAdministrate={this.state.canAdministrate}
            refreshRunsheet={this.detailRefreshRunsheet} updateRunsheet={this.detailUpdateRunsheet}
            deleteRow={this.detailDeleteRow} moveUp={this.detailMoveUp} moveDown={this.detailMoveDown}
            changeRowField={this.detailChangeRowField} setStartTime={this.detailSetStartTime} />
        );
      }
    },

    renderDetails: function(sheet) {
      if (sheet.event_name) {
        return (
          <div className="panel panel-default">
              <div className="panel-heading">
                  <h3 className="panel-title">{sheet.event_name} on {sheet.on_date}</h3>
              </div>
              <div className="panel-body">
                <div>
                    <label>Date</label>
                    <div>
                      <a href={'/rota/events/' + sheet.event_id + '/' + sheet.on_date} title="View Event Date">{moment(sheet.on_date).format('DD/MM/YYYY')}</a>
                    </div>
                </div>
                <div>
                    <label>Focus</label>
                    <div>{sheet.focus}</div>
                </div>
                <div>
                    <label>Notes</label>
                    <div>{sheet.notes}</div>
                </div>
                <div>
                    <label>Run Sheet</label>&nbsp;
                    <span>{this.renderRunSheetLink(sheet)}</span>
                    {this.renderRunSheet(sheet)}
                </div>
              </div>
          </div>
        );
      } else {
        return (
          <div className="panel panel-default">
              <div className="panel-heading">
                  <h3 className="panel-title">No Run Sheet Found</h3>
              </div>
              <div className="panel-body">
                <div>
                    No Run Sheet found for the event and date.
                </div>
              </div>
          </div>
        );
      }

    },

    renderRunsheetNotes: function(sheet) {
      if (sheet.event_name) {
        return (
          <RunsheetNotes sheet={sheet} notes={this.state.notes} canAdministrate={this.state.canAdministrate}
            refreshRunsheet={this.notesRefreshRunsheet} updateRunsheet={this.notesUpdateRunsheet}
            deleteRow={this.notesDeleteRow} moveUp={this.notesMoveUp} moveDown={this.notesMoveDown}
            changeRowField={this.notesChangeRowField} />
        );
      }
    },

    renderRunsheetEvents: function(sheet) {
      if (sheet.event_name) {
        return (
          <RunsheetEvents sheet={sheet} />
        );
      }
    },

    renderImportButton: function() {
      if (this.state.canAdministrate) {
        return (
          <button className="btn btn-default" onClick={this.handleImportToggle}>Import from Template</button>
        );
      }
    },

    renderImportTemplate: function() {
      if (!this.state.import) { return };

      return (
        <div>
          <em>Select a template to build the run sheet. This will overwrite the current run sheet.</em>
          <div>
            <label>Select Template</label>
            <select name="template" className="form-control" value={this.state.templateId} onChange={this.handleChangeTemplate}>
              <option>--</option>
              {this.state.templates.map(function(t) {
                return (
                  <option key={t.id} value={t.id}>{t.name}</option>
                )
              })}
            </select>
            <div>
              <button className="btn btn-primary" onClick={this.handleImportTemplate}>Import</button>
              <button className="btn btn-default" onClick={this.handleImportToggle}>Cancel</button>
            </div>
            <br />
          </div>

        </div>
      )
    },

    render: function() {
      var sheet = this.state.sheet;

      return (
        <div id="main" className="container-fluid" role="main">
            <Navigation active="runsheets" />
            <h2>Run Sheet {this.renderImportButton()}</h2>
            {this.renderImportTemplate()}
            {this.renderDetails(sheet)}
            {this.renderRunsheetNotes(sheet)}
            {this.renderRunsheetEvents(sheet)}
        </div>
      );
    }

});

module.exports = Runsheet;

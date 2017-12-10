import React, { Component } from 'react';
var Navigation = require('../components/Navigation');
var RunsheetDetail = require('../components/RunsheetDetail');
var RunsheetNotes = require('../components/RunsheetNotes');
var EventModel = require('../models/event');
var Person = require('../models/person');
var Utils = require('../models/utils');


var DEFAULT_TEMPLATE = {runsheet: {start: '09:00', end: '09:00', rows: []} notes:{rows:[]}};


class RunsheetTemplate extends Component {

  getInitialState() {
    return {
      template: DEFAULT_TEMPLATE, events: [], canAdministrate: false
    };
  }

  componentDidMount() {
    this.getParentEvents();
    this.getTemplate();
    this.getPermissions();
  }

  getTemplate() {
    var self = this;
    EventModel.runsheetTemplate(this.props.params.id).then(function(response) {
      var data = JSON.parse(response.body);
      if (!data.template.runsheet) {
        data.template.runsheet = DEFAULT_TEMPLATE.runsheet;
      } else {
        data.template.runsheet = JSON.parse(data.template.runsheet)
      }
      if (!data.template.notes) {
        data.template.notes = DEFAULT_TEMPLATE.notes;
      } else {
        data.template.notes = JSON.parse(data.template.notes)
      }
      self.setState({template: data.template});
    });
  }

  getParentEvents() {
    var self = this;
    EventModel.runsheetParentEvents().then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({events: data.events});
    });
  }

  getPermissions (eventId) {
      var eventId = this.state.template.event_id;
      var self = this;
      Person.permissions().then(function(response) {
          var user = JSON.parse(response.body);
          self.setState({user: user.permissions, canAdministrate: self.setCanAdministrate(eventId, user.permissions)});
      });
  }

  setCanAdministrate(eventId, user) {
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
  }

  templateChangeField(field, value) {
    var template = this.state.template;
    template[field] = value;
    this.setState({template: template});
  }

  handleSaveTemplate() {
    var self = this;
    EventModel.runsheetTemplateUpdate(this.props.params.id, this.state.template).then(function(response) {
      var data = JSON.parse(response.body);
      self.getTemplate();
    });
  }

  handleChangeName(e) {
    this.templateChangeField('name', e.target.value);
  }
  handleChangeEvent(e) {
    this.templateChangeField('event_id', parseInt(e.target.value));
    this.setState({canAdministrate: setCanAdministrate(this.state.template.event_id, this.state.user)});
  }

  // Callbacks for the run sheet template details
  detailRefreshRunsheet() {
    this.getTemplate();
  }

  detailUpdateRunsheet(detail) {
    var template = this.state.template;
    template.runsheet = detail;
    return EventModel.runsheetTemplateUpdate(this.props.params.id, template);
  }

  detailDeleteRow(rowIndex) {
    var self = this;
    var template = this.state.template;
    template.runsheet.rows.splice(rowIndex, 1);
    this.setState({template: template});
  }

  detailMoveDown(rowIndex) {
    var template = this.state.template;
    if (rowIndex < template.runsheet.rows.length-1) {
      // Swap items n and n+1
      template.runsheet.rows = Utils.arraySwap(template.runsheet.rows, rowIndex, rowIndex+1);
      this.setState({template: template});
      return rowIndex+1;
    } else {
      return rowIndex;
    }
  }

  detailMoveUp(rowIndex) {
    if (rowIndex > 0) {
      // Swap items n and n-1
      var template = this.state.template;
      template.runsheet.rows = Utils.arraySwap(template.runsheet.rows, rowIndex-1, rowIndex);
      this.setState({template: template});
      return rowIndex-1;
    } else {
      return rowIndex;
    }
  }

  detailChangeRowField(rowIndex, field, value) {
    var template = this.state.template;
    template.runsheet.rows[rowIndex][field] = value;
    this.setState({template: template});
  }

  detailSetStartTime(start) {
    var template = this.state.template;
    template.runsheet.start = start;
    this.setState({template: template});
  }

  // Callbacks for the run sheet notes
  notesRefreshRunsheet() {
    this.getTemplate();
  }

  notesUpdateRunsheet(notes) {
    var template = this.state.template;
    template.notes = notes;
    return EventModel.runsheetTemplateUpdate(this.props.params.id, template);
  }

  notesDeleteRow(rowIndex) {
    var self = this;
    var template = this.state.template;
    template.notes.rows.splice(rowIndex, 1);
    this.setState({template: template});
  }

  notesMoveDown(rowIndex) {
    var template = this.state.template;
    if (rowIndex < template.notes.rows.length-1) {
      // Swap items n and n+1
      template.notes.rows = Utils.arraySwap(template.notes.rows, rowIndex, rowIndex+1);
      this.setState({template: template});
      return rowIndex+1;
    } else {
      return rowIndex;
    }
  }

  notesMoveUp(rowIndex) {
    if (rowIndex > 0) {
      // Swap items n and n-1
      var template = this.state.template;
      template.notes.rows = Utils.arraySwap(template.notes.rows, rowIndex-1, rowIndex);
      this.setState({template: template});
      return rowIndex-1;
    } else {
      return rowIndex;
    }
  }

  notesChangeRowField(rowIndex, field, value) {
    var template = this.state.template;
    template.notes.rows[rowIndex][field] = value;
    this.setState({template: template});
  }

  renderSaveButton() {
    if (this.state.canAdministrate) {
      return (
        <span>
          <button className="btn btn-primary" onClick={this.handleSaveTemplate}>Save</button>&nbsp;
          <a href="/rota/runsheets" className="btn btn-default">Close</a>
        </span>
      );
    }
  }

  renderName(template) {
    if (this.state.canAdministrate) {
      return (
        <div>
            <label>Name</label>
            <div><input name="name" className="form-control" value={template.name}
              onChange={this.handleChangeName} placeholder="name of the template"/></div>
        </div>
      );
    } else {
      return (
        <div>
            <label>Name</label>
            <div>{template.name}</div>
        </div>
      );
    }
  }

  renderEvents(template) {
    if (this.state.canAdministrate) {
      return (
        <div>
            <label>Event</label>
            <div>
              <select name="event_id" className="form-control"
                      value={template.event_id}
                      onChange={this.handleChangeEvent} placeholder="event name">
                  {this.state.events.map(function(e) {
                      return (
                          <option key={e.id} value={e.id}>{e.name}</option>
                      );
                  })}
              </select>
            </div>
        </div>
      );
    } else {
      return (
        <div>
            <label>Event</label>
            <div>{template.event_name}</div>
        </div>
      );
    }
  }

  render() {
    var template = this.state.template;

    return (
      <div id="main" className="container-fluid" role="main">
          <Navigation active="runsheets" />
          <h2>Run Sheet Template</h2>
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">{template.id ? 'Edit Template' : 'New Template'}</h3>
            </div>
            <div className="panel-body">
              {this.renderName(template)}
              {this.renderEvents(template)}
              <div>
                {this.renderSaveButton()}
              </div>
            </div>
          </div>

          <RunsheetDetail sheet={template.runsheet} canAdministrate={this.state.canAdministrate}
            refreshRunsheet={this.detailRefreshRunsheet} updateRunsheet={this.detailUpdateRunsheet}
            deleteRow={this.detailDeleteRow} moveUp={this.detailMoveUp} moveDown={this.detailMoveDown}
            changeRowField={this.detailChangeRowField} setStartTime={this.detailSetStartTime} />

          <RunsheetNotes sheet={template} notes={template.notes} canAdministrate={this.state.canAdministrate}
            refreshRunsheet={this.notesRefreshRunsheet} updateRunsheet={this.notesUpdateRunsheet}
            deleteRow={this.notesDeleteRow} moveUp={this.notesMoveUp} moveDown={this.notesMoveDown}
            changeRowField={this.notesChangeRowField} />

      </div>
    );
  }

}

export default RunsheetTemplate;

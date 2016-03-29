'use strict'
var React = require('react');
var Navigation = require('../components/Navigation');
var RunsheetDetail = require('../components/RunsheetDetail');
var RunsheetNotes = require('../components/RunsheetNotes');
var EventModel = require('../models/event');


var DEFAULT_TEMPLATE = {start: '09:00', rows: [], notes:{rows:[]}};

var RunsheetTemplateNew = React.createClass({
  getInitialState() {
    return {
      template: DEFAULT_TEMPLATE, events: [], message: null
    };
  },

  componentDidMount() {
    this.getParentEvents()
  },

  getParentEvents: function() {
    var self = this;
    EventModel.runsheetParentEvents().then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({events: data.events, message: self.checkPermissions(data.events)});
    });
  },

  checkPermissions: function(events) {
    if (events.length === 0) {
      return 'You do not have permissions to administrate any events.';
    }
  },

  templateChangeField: function(field, value) {
    var template = this.state.template;
    template[field] = value;
    this.setState({template: template});
  },

  handleChangeName: function(e) {
    this.templateChangeField('name', e.target.value);
  },
  handleChangeEvent: function(e) {
    this.templateChangeField('event_id', parseInt(e.target.value));
  },

  handleSave: function() {
    // Check the mandatory fields are entered
    var template = this.state.template;
    if ((!template.name) || (template.name.trim().length===0) || (!template.event_id)) {
      this.setState({message: 'The template name and the event name must be entered.'});
      return;
    }

    // Save the template and redirect to the edit screen
    var self = this;
    EventModel.runsheetTemplateCreate(template.name, template.event_id).then(function(response) {
      var data = JSON.parse(response.body);
      if (data.response === 'Success') {
        // Redirect to the edit page
        window.location.href = '/rota/runsheets/templates/' + data.template_id;
      } else {
        self.setState({message: data.message});
      }
    });

  },

  renderMessage: function() {
    if (this.state.message) {
      return (
        <div className="alert alert-danger">
          {this.state.message}
        </div>
      )
    }
  },

  renderButtons: function() {
    if (this.state.events.length > 0) {
      return (
        <div>
          <button className="btn" onClick={this.handleSave}>Save</button>&nbsp;
          <a className="btn btn-default" href="/rota/runsheets">Cancel</a>
        </div>
      );
    }
  },

  render: function() {
    var template = this.state.template;

    return (
      <div id="main" className="container-fluid" role="main">
          <Navigation active="runsheets" />
          <h2>Run Sheet Template</h2>

          {this.renderMessage()}

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">{template.id ? 'Edit Template' : 'New Template'}</h3>
            </div>
            <div className="panel-body">
              <div>
                  <label>Name</label>
                  <div><input name="name" className="form-control" value={template.name}
                    onChange={this.handleChangeName} placeholder="name of the template"/></div>
              </div>
              <div>
                  <label>Event</label>
                  <div>
                    <select name="event_id" defaultValue={template.event_id} className="form-control"
                            onChange={this.handleChangeEvent} placeholder="event name">
                        <option key={0}>-- Select an Event --</option>
                        {this.state.events.map(function(e) {
                            return (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            );
                        })}
                    </select>
                  </div>
              </div>
            </div>
          </div>
          {this.renderButtons()}
      </div>
    );
  }
});

module.exports = RunsheetTemplateNew;

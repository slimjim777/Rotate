'use strict'
var React = require('react');
var Navigation = require('../components/Navigation');
var SongModel = require('../models/song');
var EventModel = require('../models/event');
var Person = require('../models/person');
import Pikaday from 'react-pikaday';
var moment = require('moment');


var SetListNew = React.createClass({
  getInitialState: function() {
    return {setlists: [], message: null, events: [], user: {}, onDate: moment().toDate(), eventId: null};
  },

  componentDidMount: function() {
    this.getPermissions();
    this.getParentEvents();
  },

  getPermissions: function () {
      var self = this;
      Person.permissions().then(function(response) {
          var user = JSON.parse(response.body);
          self.setState({user: user.permissions});
          if (!self.hasPermissions(user.permissions)) {
            self.setState({message: 'You do not have permissions to create set lists.'});
          }
      });
  },

  getParentEvents: function() {
    var self = this;
    EventModel.runsheetParentEvents().then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({events: data.events});
    });
  },

  hasPermissions: function(user) {
    if ((user.music_role) && ((user.music_role === 'standard') || (user.music_role === 'admin'))) {
      return true;
    } else {
      return false;
    }
  },

  handleChangeOnDate: function(date) {
    this.setState({onDate: date});
  },

  handleChangeEvent: function(e) {
    this.setState({eventId: parseInt(e.target.value)});
  },

  handleSave: function() {
    var self = this;

    if (!this.state.eventId) {
      this.setState({message: 'Both the date and the event must be entered.'});
      return;
    } else {
      var onDate = moment(this.state.onDate).format('YYYY-MM-DD');
      SongModel.upsertSetList(this.state.eventId, onDate).then(function(response) {
        window.location.href = '/rota/events/'.concat(self.state.eventId, '/', onDate, '/setlist')
        self.setState({message: null});
      });
    }
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

  renderPanel: function() {
    if (this.hasPermissions(this.state.user)) {
      return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Set List</h3>
          </div>
          <div className="panel-body">
            <div>
                <label>Date</label>
                <div>
                  <Pikaday value={this.state.onDate} onChange={this.handleChangeOnDate} />
                </div>
            </div>
            <div>
                <label>Event</label>
                <div>
                  <select name="event_id" defaultValue={this.state.eventId} className="form-control"
                          onChange={this.handleChangeEvent} placeholder="event name">
                      <option key={0} value={0}>-- Select an Event --</option>
                      {this.state.events.map(function(e) {
                          return (
                              <option key={e.id} value={e.id}>{e.name}</option>
                          );
                      })}
                  </select>
                </div>
            </div>
            <div>
              <button className="btn" onClick={this.handleSave}>Save</button>&nbsp;
              <a className="btn btn-default" href="/rota/setlists">Cancel</a>
            </div>
          </div>
        </div>
      );
    }

  },

  render: function() {
    return (
      <div id="main" className="container-fluid" role="main">
          <Navigation active="setlists" />
          <h2>New Set List</h2>
          {this.renderMessage()}
          {this.renderPanel()}
      </div>
    )
  }

});

module.exports = SetListNew;

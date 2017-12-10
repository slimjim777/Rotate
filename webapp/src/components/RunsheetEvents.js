import React, { Component } from 'react';
var moment = require('moment');
var Navigation = require('../components/Navigation');
var EventModel = require('../models/event');


// List the events for the runsheet
class RunsheetEvents extends Component {

  getInitialState() {
    return {events: []};
  }

  componentDidMount() {
    this.getEvents(this.props.sheet.event_id);
  }

  getEvents(eventId) {
    var self = this;
    EventModel.runsheetEvents(eventId).then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({events: data.events});
    });
  }

  render() {
    var onDate = this.props.sheet.on_date;
    return (
      <div className="panel panel-default">
          <div className="panel-heading">
              <h3 className="panel-title">Rotas</h3>
          </div>
          <div className="panel-body">
            <div>
                {this.state.events.map(function(ev) {
                  return (
                    <div key={ev.id}>
                      <a href={'/rota/events/' + ev.id + '/' + onDate}>{ev.name}</a>
                    </div>
                  );
                })}
            </div>
          </div>
      </div>
    );
  }

}

export default RunsheetEvents;

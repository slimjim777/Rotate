import React, { Component } from 'react';
var EventModel = require('../models/event');
var Person = require('../models/person');


class RunsheetTemplates extends Component {

  getInitialState() {
    return {templates: []};
  }

  componentDidMount() {
    this.getTemplates();
    this.getPermissions();
  }

  getTemplates() {
    var self = this;
    EventModel.runsheetTemplates().then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({templates: data.templates});
    });
  }

  getPermissions () {
      var self = this;
      Person.permissions().then(function(response) {
          var user = JSON.parse(response.body);
          self.setState({user: user.permissions, canAdministrate: self.setCanAdministrate(user.permissions)});
      });
  }

  setCanAdministrate(user) {
      if (user.role == 'admin') {
          return true;
      } else {
        return user.events_admins.length > 0;
      }
  }

  renderActions() {
    if (this.state.canAdministrate) {
      return (
        <a className="btn" title="New Template" href="/rota/runsheets/templates/new">
            <span className="glyphicon glyphicon-plus"></span>
        </a>
      );
    }
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
            <h3 className="panel-title">
              Templates&nbsp;
              {this.renderActions()}
            </h3>
        </div>
        <div className="panel-body table-responsive">
          <table className="table table-striped">
              <thead>
              <tr>
                  <th>Name</th><th>Event</th>
              </tr>
              </thead>
              <tbody>
              {this.state.templates.map(function(t) {
                  var url = '/rota/runsheets/templates/' + t.id;
                  return (
                      <tr key={t.id}>
                          <td><a href={url}>{t.name}</a></td><td><a href={url}>{t.event_name}</a></td>
                      </tr>
                  );
              })}
              </tbody>
          </table>
        </div>
      </div>
    )
  }

}

export default RunsheetTemplates;

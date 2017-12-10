import React, { Component } from 'react';
var EventModel = require('../models/event');
var EventDate = require('../models/eventdate');
var Navigation = require('../components/Navigation');
var EventDateAdd = require('../components/EventDateAdd');
var Person = require('../models/person');
var moment = require('moment');

var DISPLAY_FORMAT = 'DD/MM/YYYY';
var STANDARD_FORMAT = 'YYYY-MM-DD';


class EventOverview extends Component {

    getInitialState() {
        return ({model: {}, roles: [], rota: [], fromDate: moment().format(STANDARD_FORMAT), eventLoading: false,
            editing: null, editRoles: [], editValues: {}, showEventAdd: false});
    }

    componentDidMount() {
        // Get the event
        var modelId = this.props.params.id;
        this.getEvent(modelId);
        this.getEventRoles(modelId);
        this.getEventRota(modelId);

        // Get the user permissions
        this.getPermissions(modelId);
    }

    getEvent(modelId) {
        var self = this;
        self.setState({eventLoading: true });
        EventModel.findById(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({model: data.event, eventLoading: false });
        });
    }

    getEventRoles(modelId) {
        var self = this;
        EventModel.roles(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({roles: data.roles});
        });
    }

    getEventRota(modelId) {
        var self = this;
        EventModel.rota(modelId, this.state.fromDate).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({rota: data.rota});
        });
    }

    getPermissions (modelId) {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body);
            self.setState({user: user.permissions, canAdministrate: self.setCanAdministrate(self.props.params.id, user.permissions)});
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

    handleChangeFromDate(e) {
        var d = moment(e.target.value, STANDARD_FORMAT)
        this.setState({fromDate: d.format(STANDARD_FORMAT)});
    }

    handleClickEdit(e) {
        e.preventDefault();
        if (!this.state.canAdministrate) {
            return;
        }

        var self = this;
        var onDate = e.target.getAttribute('data-key');

        if (!onDate) {
            self.setState({editing: null, editValues: {}});
            return;
        }

        // Get the roles and away status for this date
        EventModel.date(this.state.model.id, onDate).then(function(response) {
            var data = JSON.parse(response.body).event_date;
            self.setState({editing: onDate, editRoles: data.roles,
                editValues: {focus: data.summary.focus, notes: data.summary.notes, url: data.summary.url}});
        });
    }

    handleClickDateChange() {
        this.getEventRota(this.state.model.id);
    }

    handleChangeFocus(e) {
        var values = this.state.editValues;
        values.focus = e.target.value;
        this.setState({editValues: values});
    }
    handleChangeNotes(e) {
        var values = this.state.editValues;
        values.notes = e.target.value;
        this.setState({editValues: values});
    }
    handleChangeURL(e) {
        var values = this.state.editValues;
        values.url = e.target.value;
        this.setState({editValues: values});
    }

    handleRoleSelection(e) {
        var roleId = parseInt(e.target.getAttribute('data-role'));
        var personId = parseInt(e.target.value)

        var roles = this.state.editRoles.map(function(r) {
            if (r.role_id === roleId) {
                r.person_id = personId;
            }
            return r;
        });

        var editValues = this.state.editValues;
        editValues[roleId] = personId;

        this.setState({editRoles: roles, editValues: editValues});

    }

    handleClickSave() {
        var self = this;

        var result = EventModel.upsertRota(this.state.model.id, this.state.editing, this.state.editValues,
            this.state.editValues.focus, this.state.editValues.notes, this.state.editValues.url).then(
            function(response) {
                self.setState({editing: null, editValues: {}}, self.getEventRota(self.state.model.id));
            });
    }

    handleAddEventDate(e) {
      e.preventDefault();
      this.setState({showEventAdd: !this.state.showEventAdd});
    }

    handleAddEventDateSave(eventDate) {
      this.setState({showEventAdd: false, fromDate: eventDate});
      this.getEventRota(this.props.params.id);
    }

    renderName(r) {
      if (r.is_away) {
        return (
          <span className="alert-danger" title="Away, swap needed">
            {r.firstname} {r.lastname}
          </span>
        );
      } else if (r.on_rota) {
        return (
          <span className="alert-warning" title="On rota for another team">
            {r.firstname} {r.lastname}
          </span>
        );
      } else {
        return (
          <span>{r.firstname} {r.lastname}</span>
        );
      }
    }

    renderNewEventDateButton() {
        if (this.state.canAdministrate) {
            return (
                <button id="create-event-dates" className="btn btn-primary"
                        onClick={this.handleAddEventDate}
                        data-toggle="modal" data-target="#dialog-form" title="New Event Date">
                    <span className="glyphicon glyphicon-plus"></span>
                </button>
            );
        }
    }

    renderEventDate() {
      if (this.state.showEventAdd) {
        return (
          <EventDateAdd eventId={this.props.params.id}
            onClickSave={this.handleAddEventDateSave} onClickCancel={this.handleAddEventDate} />
        );
      }
    }

    render() {
        var self = this;
        var model = this.state.model;

        return (
            <div id="main" className="container-fluid" role="main">
                <Navigation active="events" />
                <h2 className="sub-heading">{model.name} {this.renderNewEventDateButton()}</h2>
                {this.renderEventDate()}

                <div className="col-lg-3">
                    <div className="form-group form-horizontal">
                        <label>From Date:</label>
                        <input type="date" name="fromDate" value={this.state.fromDate}
                               onChange={this.handleChangeFromDate} />
                        <button className="btn btn-primary" onClick={this.handleClickDateChange}>Go</button>
                    </div>
                </div>

                <div className="col-lg-12 table-responsive">
                    <table className="table table-striped rota">
                        <thead>
                        <tr>
                            <th>Date</th><th className="first-column">Focus</th><th>Notes</th><th>Run Sheet</th>
                            {this.state.roles.map(function(role) {
                                return <th key={role.id}>{role.name}</th>;
                            })}
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.rota.map(function(r) {
                            if (r.on_date === self.state.editing) {
                                return (
                                    <tr key={r.on_date}>
                                        <td>
                                            <button className="btn" onClick={self.handleClickSave}>Save</button>
                                            <a href="" onClick={self.handleClickEdit}>Cancel</a>
                                        </td>
                                        <td>
                                            <input value={self.state.editValues.focus} placeholder="focus"
                                                   onChange={self.handleChangeFocus} />
                                        </td>
                                        <td>
                                            <input value={self.state.editValues.notes} placeholder="notes"
                                                   onChange={self.handleChangeNotes} />
                                        </td>
                                        <td>
                                            <input value={self.state.editValues.url} placeholder="run sheet URL"
                                                   onChange={self.handleChangeURL} />
                                        </td>
                                        {self.state.editRoles.map(function (role) {
                                            return (
                                                <td key={role.role_id}>
                                                    <select value={role.person_id} onChange={self.handleRoleSelection}
                                                            data-role={role.role_id}>
                                                        <option value="0"></option>
                                                    {role.roles.map(function(r){
                                                        return (
                                                            <option key={r.person_id} value={r.person_id}>
                                                                {r.firstname} {r.lastname}
                                                            </option>
                                                        );
                                                    })}
                                                    </select>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            } else {
                                return (
                                    <tr key={r.on_date}>
                                        <td>
                                            {self.state.canAdministrate ?
                                            <button className="btn btn-primary btn-sm" onClick={self.handleClickEdit} data-key={r.on_date}
                                               data-date_id={r.event_date_id} title="Edit rota">
                                                {moment(r.on_date).format('DD MMM')}
                                            </button>
                                            : moment(r.on_date).format('DD MMM')}&nbsp;
                                            <a href={'/rota/events/'.concat(model.id, '/', moment(r.on_date).format('YYYY-MM-DD'))}
                                                   data-key={r.on_date} title="View">View</a>
                                        </td>
                                        <td>{r.focus}</td>
                                        <td>{r.notes}</td>
                                        <td>
                                          {r.url ? <a href={r.url} >Run Sheet {moment(r.on_date).format('DD MMM')}</a> : ''}
                                          <a href={'/rota/events/'.concat(model.id, '/', moment(r.on_date).format('YYYY-MM-DD'), '/runsheet')}
                                            className="btn btn-default">View</a>
                                        </td>
                                        {self.state.roles.map(function (rl) {
                                            var role = r.roles[rl.id];
                                            return (
                                                <td key={rl.id}>
                                                    <a href={'/rota/person/' + role.person_id}>
                                                        {self.renderName(role)}
                                                    </a>
                                                </td>
                                            );
                                        })}
                                        <td><a href={'/rota/events/'.concat(model.id, '/', moment(r.on_date).format('YYYY-MM-DD'))}
                                               data-key={r.on_date}>{moment(r.on_date).format('DD MMM')}</a></td>
                                    </tr>
                                );
                            }
                        })}

                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default EventOverview;

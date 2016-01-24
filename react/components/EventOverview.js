'use strict';
var React = require('react');
var EventModel = require('../models/event');
var EventDate = require('../models/eventdate');
var Person = require('../models/person');
var moment = require('moment');

var DISPLAY_FORMAT = 'DD/MM/YYYY';
var STANDARD_FORMAT = 'YYYY-MM-DD';

var EventOverview = React.createClass({

    getInitialState: function() {
        return ({model: {}, roles: [], rota: [], fromDate: moment().format(STANDARD_FORMAT), eventLoading: false,
            editing: null, editRoles: [], editValues: {}});
    },

    componentDidMount: function() {
        // Get the event
        var modelId = this.props.params.id;
        this.getEvent(modelId);
        this.getEventRoles(modelId);
        this.getEventRota(modelId);

        // Get the user permissions
        this.getPermissions(modelId);
    },

    getEvent: function(modelId) {
        var self = this;
        self.setState({eventLoading: true });
        EventModel.findById(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({model: data.model, eventLoading: false });
        });
    },

    getEventRoles: function(modelId) {
        var self = this;
        EventModel.roles(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({roles: data.roles});
        });
    },

    getEventRota: function(modelId) {
        var self = this;
        EventModel.rota(modelId, this.state.fromDate).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({rota: data.rota});
        });
    },

    getPermissions: function (modelId) {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body);
            user.role_rota = sessionStorage.getItem('role_rota');
            self.setState({user: user, canAdministrate: self.canAdministrate(modelId, user)});
        });
    },

    canAdministrate: function(eventId, user) {
        if (user.role_rota == 'admin') {
            return true;
        } else {
            var events = this.state.rota_permissions.filter(function(permission) {
                return permission.event_id === eventId;
            });
            if (events.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    },

    handleChangeFromDate: function(e) {
        var d = moment(e.target.value, STANDARD_FORMAT)
        this.setState({fromDate: d.format(STANDARD_FORMAT)});
    },

    handleClickEdit: function(e) {
        e.preventDefault();
        if (!this.state.canAdministrate) {
            return;
        }

        var self = this;
        var onDate = e.target.getAttribute('data-key');
        //var eventDateId = parseInt(e.target.getAttribute('data-date_id') | 0);

        if (!onDate) {
            self.setState({editing: null, editValues: {}});
            return;
        }

        // Get the roles and away status for this date
        EventModel.date(this.state.model.id, onDate).then(function(response) {
            var data = JSON.parse(response.body);
            console.log(data);
            self.setState({editing: onDate, editRoles: data.roles,
                editValues: {focus: data.summary.focus, notes: data.summary.notes, url: data.summary.url}});
        });
    },

    handleClickDateChange: function() {
        this.getEventRota(this.state.model.id);
    },

    handleChangeFocus: function(e) {
        var values = this.state.editValues;
        values.focus = e.target.value;
        this.setState({editValues: values});
    },
    handleChangeNotes: function(e) {
        var values = this.state.editValues;
        values.notes = e.target.value;
        this.setState({editValues: values});
    },
    handleChangeURL: function(e) {
        var values = this.state.editValues;
        values.url = e.target.value;
        this.setState({editValues: values});
    },

    handleRoleSelection: function(e) {
        var roleId = parseInt(e.target.getAttribute('data-role'));
        var personId = parseInt(e.target.value)

        var roles = this.state.editRoles.map(function(r) {
            if (r.roleId === roleId) {
                r.personId = personId;
            }
            return r;
        });

        var editValues = this.state.editValues;
        editValues[roleId] = personId;

        console.log(editValues);
        console.log(roles);
        console.log(personId);
        //console.log(this.state.editRoles);
        this.setState({editRoles: roles, editValues: editValues});

    },

    handleClickSave: function() {
        var self = this;
        console.log('Save');
        console.log(this.state.editValues);
        var result = EventDate.createRota(this.state.model.id, this.state.editing, this.state.editValues,
            this.state.editValues.focus, this.state.editValues.notes, this.state.editValues.url).then(
            function(response) {
                self.setState({editing: null, editValues: {}}, self.getEventRota(self.state.model.id));
            });
    },

    render: function() {
        var self = this;
        var model = this.state.model;

        return (
            <div id="main" className="container-fluid" role="main">
                <h2 className="sub-heading">{model.name}</h2>

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
                                                <td key={role.roleId}>
                                                    <select value={role.personId} onChange={self.handleRoleSelection}
                                                            data-role={role.roleId}>
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
                                            <a href="" onClick={self.handleClickEdit} data-key={r.on_date}
                                               data-date_id={r.event_date_id}>
                                                {moment(r.on_date).format('DD MMM')}
                                            </a>
                                            : moment(r.on_date).format('DD MMM')}
                                        </td>
                                        <td>{r.focus}</td>
                                        <td>{r.notes}</td>
                                        <td>{r.url}</td>
                                        {self.state.roles.map(function (rl) {
                                            var role = r.roles[rl.id];
                                            return (
                                                <td key={rl.id}>
                                                    <a href={'#/person/' + role.person_id}>
                                                        {role.firstname} {role.lastname}
                                                    </a>
                                                </td>
                                            );
                                        })}
                                        <td><a href="" onClick={self.handleClickEdit}
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
});

module.exports = EventOverview;
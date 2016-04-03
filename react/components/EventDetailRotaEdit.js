'use strict';
var React = require('react');
var moment = require('moment');
var EventModel = require('../models/event');


var EventDetailRotaEdit = React.createClass({

    getInitialState: function() {
        var summary = this.props.summary;
        return {focus: summary.focus, notes: summary.notes, url: summary.url, rota: {}};
    },

    handleChangeFocus: function(e) {
        e.preventDefault();
        this.setState({focus: e.target.value});
    },
    handleChangeNotes: function(e) {
        e.preventDefault();
        this.setState({notes: e.target.value});
    },
    handleChangeRunSheet: function(e) {
        e.preventDefault();
        this.setState({url: e.target.value});
    },
    handleChangeRota: function(e) {
        e.preventDefault();
        // Get the role id and value
        var roleId = e.target.name.replace('role-','');
        var rota = this.state.rota;
        rota[roleId] = e.target.value;
        this.setState({rota: rota});
    },

    handleSave: function(e) {
        e.preventDefault();
        var self = this;

        EventModel.upsertRota(this.props.model.id, this.props.onDate, this.state.rota, this.state.focus,
            this.state.notes, this.state.url).then(function(data) {
            self.props.refreshData();
        });
    },

    renderRoleSelect: function(rota, roleIndex) {
        return (
            <tr key={roleIndex}>
                <td>{rota.role_name}</td>
                <td>
                    <select name={"role-".concat(rota.role_id)} defaultValue={rota.person_id} className="form-control"
                            onChange={this.handleChangeRota}>
                        <option value="0">&nbsp;</option>
                        {rota.roles.map(function(r) {
                            return (
                                <option key={'role'.concat(r.role_id, '-', r.person_id)} value={r.person_id}>
                                    {r.firstname} {r.lastname} {r.is_away ? '(Away)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </td>
            </tr>
        );
    },

    render: function () {
        var summary = this.props.summary;
        var roles = this.props.roles;
        var self = this;
        var roleIndex = 0;

        if (!this.props.onDate) {
            return (
                <div>Select a date to display the rota.</div>
            );
        }

        return (
            <div className="col-md-8 col-sm-8 col-xs-12">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 className="sub-heading">
                            <button className="btn btn-primary" onClick={this.handleSave}>Save</button> &nbsp;
                            <button className="btn btn-default" onClick={this.props.toggleEdit}>Cancel</button>
                            On {moment(summary.on_date).format('DD/MM/YYYY')}</h4>
                    </div>
                    <div className="panel-body">
                        <div>
                            <label>Focus</label>
                            <div><textarea name="focus" className="form-control" value={this.state.focus}
                                           onChange={this.handleChangeFocus} /></div>
                        </div>
                        <div>
                            <label>Notes</label>
                            <div><textarea name="notes" className="form-control" value={this.state.notes}
                                           onChange={this.handleChangeNotes} /></div>
                        </div>
                        <div>
                            <label>Run Sheet</label>
                            <div><textarea name="runsheet" className="form-control" value={this.state.url}
                                           onChange={this.handleChangeRunSheet} /></div>
                        </div>
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th>Role</th><th>Name</th>
                            </tr>
                            </thead>
                            <tbody>
                            {roles.map(function(r) {
                                roleIndex += 1;
                                return self.renderRoleSelect(r, roleIndex);
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = EventDetailRotaEdit;

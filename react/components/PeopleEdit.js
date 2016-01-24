'use strict';
var React = require('react');
var Person = require('../models/person');


var PeopleEdit = React.createClass({

    getInitialState: function() {
        return {person: {}}
    },

    componentDidMount: function () {
        var self = this;
        // Get the person ID
        var personId = this.props.params.id;

        // Get the person details
        Person.findById(personId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({person: data});
        });
    },

    updateState: function(attribute, value) {
        var person = this.state.person;
        person[attribute] = value;
        this.setState({person: person});
    },

    handleFirstnameChange: function(e) {
        this.updateState('firstname', e.target.value);
    },
    handleLastnameChange: function(e) {
        this.updateState('lastname', e.target.value);
    },
    handleEmail: function(e) {
        this.updateState('email', e.target.value);
    },
    handleGuest: function(e) {
        this.updateState('guest', e.target.checked);
    },
    handleActive: function(e) {
        this.updateState('active', e.target.checked);
    },
    handleRole: function(e) {
        this.updateState('user_role', e.target.value);
        this.updateState('role_rota', e.target.value);
    },

    handleSubmit: function(e) {
        e.preventDefault();
        Person.update(this.state.person).then(function(response) {
            window.location = '#/people';
        });
    },

    render: function() {
        return (
            <div className="container-fluid" role="main">
                <h2 className="sub-heading">
                    Edit Person: {this.state.person.firstname} {this.state.person.lastname}
                </h2>

                <div className="panel panel-default">
                    <div className="panel-body">
                        <form role="form">
                            <div className="form-group">
                                <label>Active</label>
                                <input type="checkbox" checked={this.state.person.active} placeholder="active"
                                       onChange={this.handleActive} />
                            </div>
                            <div className="form-group">
                                <label>Guest</label>
                                <input type="checkbox" checked={this.state.person.guest} placeholder="guest"
                                       onChange={this.handleGuest} />
                            </div>
                            <div className="form-group">
                                <label>Firstname</label>
                                <input value={this.state.person.firstname} className="form-control"
                                       placeholder="firstname" onChange={this.handleFirstnameChange} />
                            </div>
                            <div className="form-group">
                                <label>Lastname</label>
                                <input value={this.state.person.lastname} className="form-control"
                                       placeholder="lastname" onChange={this.handleLastnameChange} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input value={this.state.person.email} className="form-control" placeholder="email"
                                    onChange={this.handleEmail} />
                            </div>
                            <div className="form-group">
                                <label>Permissions</label>
                                <select name="role" value={this.state.person.user_role} onChange={this.handleRole}>
                                    <option value="standard">Standard</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="panel-footer">
                        <button onClick={this.handleSubmit} className="btn btn-primary">Save</button>&nbsp;
                        <a href="#/people">Cancel</a>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PeopleEdit;
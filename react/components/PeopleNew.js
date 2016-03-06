'use strict';
var React = require('react');
var Person = require('../models/person');


var PeopleNew = React.createClass({

    getInitialState: function() {
        return {person: {active: true}, message: null};
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
    handleMusicRole: function(e) {
        this.updateState('music_role', e.target.value);
    },

    handleSubmit: function(e) {
        var self = this;
        e.preventDefault();
        Person.create(this.state.person).then(function(response) {
            var data = JSON.parse(response.body);
            if (data.response === 'Success') {
              window.location = '/rota/people';
            }
            self.setState({message: data.message});
        });
    },

    renderMessages: function() {
        if (this.state.message) {
            return (
                <div className="alert alert-danger">{this.state.message}</div>
            );
        }
    },

    render: function() {
        return (
            <div className="container-fluid" role="main">
                <h2 className="sub-heading">
                    New Person: {this.state.person.firstname} {this.state.person.lastname}
                </h2>

                <div className="panel panel-default">
                    <div className="panel-body">
                        {this.renderMessages()}
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
                                <label>Rota Permissions</label>
                                <select name="role" value={this.state.person.user_role} onChange={this.handleRole}>
                                    <option value="standard">Standard</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Song Permissions</label>
                                <select name="music_role" value={this.state.person.music_role} onChange={this.handleMusicRole}>
                                    <option value="">None</option>
                                    <option value="set-list">View Set List</option>
                                    <option value="standard">Standard</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>                            
                        </form>
                    </div>
                    <div className="panel-footer">
                        <button onClick={this.handleSubmit} className="btn btn-primary">Save</button>&nbsp;
                        <a href="/rota/people">Cancel</a>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PeopleNew;

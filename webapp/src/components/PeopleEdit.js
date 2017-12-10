import React, { Component } from 'react';
var Person = require('../models/person');


class PeopleEdit extends Component {

    getInitialState() {
        return {person: {}}
    }

    componentDidMount () {
        var self = this;
        // Get the person ID
        var personId = this.props.params.id;

        // Get the person details
        Person.findById(personId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({person: data.person});
        });
    }

    updateState(attribute, value) {
        var person = this.state.person;
        person[attribute] = value;
        this.setState({person: person});
    }

    handleFirstnameChange(e) {
        this.updateState('firstname', e.target.value);
    }
    handleLastnameChange(e) {
        this.updateState('lastname', e.target.value);
    }
    handleEmail(e) {
        this.updateState('email', e.target.value);
    }
    handleGuest(e) {
        this.updateState('guest', e.target.checked);
    }
    handleActive(e) {
        this.updateState('active', e.target.checked);
    }
    handleRole(e) {
        this.updateState('user_role', e.target.value);
        this.updateState('role_rota', e.target.value);
    }
    handleMusicRole(e) {
        this.updateState('music_role', e.target.value);
    }
    handleSubmit(e) {
        e.preventDefault();
        Person.update(this.state.person).then(function(response) {
            window.location = '/rota/people';
        });
    }

    render() {
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
}

export default PeopleEdit;

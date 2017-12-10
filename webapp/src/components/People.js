import React, { Component } from 'react';
var Person = require('../models/person');
var PeopleList = require('../components/PeopleList');
var Navigation = require('../components/Navigation');


class People extends Component {

    getInitialState() {
        return ({peopleLoading: false, people: [], peopleFiltered: []});
    }

    componentDidMount () {
        var self = this;

        // Get the people
        self.getPeople();
    }

    contains(value, snippet) {
        if (!value) {return false;}
        if (!snippet) {return true;}
        return value.toLowerCase().indexOf(snippet.toLowerCase()) >= 0;
    }

    handleFilterChange (firstName, lastName, status) {
        var self = this;
        var people = this.state.people.filter(function(p) {
            if (!self.contains(p.firstname, firstName)) {
                return false;
            }
            if (!self.contains(p.lastname, lastName)) {
                return false;
            }
            if ((status === 'active') && (!p.active)) {
                return false;
            }
            return !((status === 'inactive') && (p.active));
        });
        this.setState({peopleFiltered: people});
    }

    getPeople() {
        var self = this;
        self.setState({peopleLoading: true});
        Person.all().then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({ people: data.people, peopleLoading: false });
            self.handleFilterChange(null, null, 'active');
        });
    }

    handleNew() {
        window.location = '/rota/people/new';
    }

    renderNew() {
        return (
          <button onClick={this.handleNew} className="btn btn-primary">
            <span className="glyphicon glyphicon-plus"></span>
          </button>
        );
    }

    render () {
        return (
            <div id="main" className="container-fluid" role="main">
                <Navigation active="people" />
                <h2>People {this.renderNew()}</h2>

                <PeopleList people={this.state.peopleFiltered} onFilterChange={this.handleFilterChange} />
            </div>
        );
    }
}


export default People;

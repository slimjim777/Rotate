'use strict';
var React = require('react');
var Person = require('../models/person');
var PeopleList = require('../components/PeopleList');
var Navigation = require('../components/Navigation');


var People = React.createClass({

    getInitialState: function() {
        return ({peopleLoading: false, people: [], peopleFiltered: []});
    },

    componentDidMount: function () {
        var self = this;

        // Get the people
        self.getPeople();
    },

    contains: function(value, snippet) {
        if (!value) {return false;}
        if (!snippet) {return true;}
        return value.toLowerCase().indexOf(snippet.toLowerCase()) >= 0;
    },

    handleFilterChange: function (firstName, lastName, status) {
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
    },

    getPeople: function() {
        var self = this;
        self.setState({peopleLoading: true});
        Person.all().then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({ people: data.people, peopleLoading: false });
            self.handleFilterChange(null, null, 'active');
        });
    },

    handleNew: function() {
        window.location = '/rota/people/new';
    },

    renderNew: function() {
        return (
          <button onClick={this.handleNew} className="btn btn-primary">
            <span className="glyphicon glyphicon-plus"></span>
          </button>
        );
    },

    render: function () {
        return (
            <div id="main" className="container-fluid" role="main">
                <Navigation active="people" />
                <h2>People {this.renderNew()}</h2>

                <PeopleList people={this.state.peopleFiltered} onFilterChange={this.handleFilterChange} />
            </div>
        );
    }
});


module.exports = People;

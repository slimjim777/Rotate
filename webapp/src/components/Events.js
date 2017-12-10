import React, { Component } from 'react';
var EventModel = require('../models/event');
var EventList = require('../components/EventList');
var Navigation = require('../components/Navigation');


class Events extends Component {

    getInitialState() {
        return ({eventsLoading: false, events: []});
    }

    componentDidMount () {
        var self = this;

        // Get the events
        self.getEvents();
    }

    getEvents() {
        var self = this;
        self.setState({eventsLoading: true});
        EventModel.all().then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({ events: data.events, eventsLoading: false });
        });
    }

    render () {
        return (
            <div id="main" className="container-fluid" role="main">
                <Navigation active="events" />
                <h2>Events</h2>

                <EventList events={this.state.events} />
            </div>
        );
    }
}


export default Events;

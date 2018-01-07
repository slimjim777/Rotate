import React, { Component } from 'react';
import EventModel from '../models/event';
import EventList from '../components/EventList';


class Events extends Component {

    constructor(props) {
        super(props)
        this.state = {eventsLoading: false, events: []};
    }

    componentDidMount () {
        // Get the events
        this.getEvents();
    }

    getEvents() {
        this.setState({eventsLoading: true});
        EventModel.all().then((response) => {
            var data = JSON.parse(response.body);
            this.setState({ events: data.events, eventsLoading: false });
        });
    }

    render () {
        return (
            <div id="main" className="container-fluid" role="main">
                <h2>Events</h2>

                <EventList events={this.state.events} user={this.props.user} />
            </div>
        );
    }
}


export default Events;

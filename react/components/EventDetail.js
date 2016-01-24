'use strict';
var React = require('react');
var EventModel = require('../models/event');
var Person = require('../models/person');
var EventDate = require('../models/eventdate');
var $ = require('jquery');
var EventDetailPanel = require('../components/EventDetailPanel');
var EventDetailRota = require('../components/EventDetailRota');
var EventDetailRotaEdit = require('../components/EventDetailRotaEdit');
var EventDetailDates = require('../components/EventDetailDates');


var EventDetail = React.createClass({

    getInitialState: function() {
        return ({eventLoading: false, model: {}, onDate: null, eventDate: {}, dateSummary: {}, rota: [], roles: [],
            eventDatesLoading: false, dates: [], user: null, isEditing: false});
    },

    componentDidMount: function () {
        $(document).on('dateTransition', this.handleDateChange);

        // Get the user permissions
        this.getPermissions();

        // Get the event
        var modelId = this.props.params.id;
        this.getEvent(modelId);
        this.getEventDates(modelId);

        var onDate = this.props.params.onDate;
        if (onDate) {
            this.getEventDate(modelId, onDate);
        }
    },

    componentWillUnmount: function () {
        $(document).off('dateTransition', this.handleDateChange);
    },

    getPermissions: function () {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            user.role_rota = sessionStorage.getItem('role_rota');
            self.setState({user: user});
        });
    },

    canAdministrate: function() {
        if (!this.state.user) {
            return false;
        }
        if (this.state.user.role_rota === 'admin') {
            return true;
        }
        if (!this.props.params.id) {
            return false;
        }
        var eventId = parseInt(this.props.params.id);
        for (var i=0; i < this.state.user.events_admin.length; i++) {
            if (this.state.user.events_admin[i].id === eventId) {
                return true;
            }
        }
        return false;
    },

    getEvent: function(modelId) {
        var self = this;
        self.setState({eventLoading: true });
        EventModel.findById(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({model: data.event, eventLoading: false });
        });
    },

    getEventDates: function(modelId) {
        var self = this;
        self.setState({eventDatesLoading: true });
        EventModel.dates(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            if ((!self.state.onDate) && (data.event_dates.length > 0)) {
                var firstDate = data.event_dates[0].on_date;
                self.getEventDate(modelId, firstDate);
            }
            self.setState({dates: data.event_dates, eventDatesLoading: false});
        });
    },

    getEventDate: function(modelId, onDate) {
        var self = this;
        self.setState({eventDateLoading: true, onDate: onDate});
        EventDate.findByDate(modelId, onDate).then(function(response) {
            var data = JSON.parse(response.body).event_date;
            self.setState({
                dateSummary: data.summary, rota: data.rota, roles: data.roles, onDate: onDate,
                eventDateLoading: false });
        });
    },

    handleDateChange: function(e, eventId, onDate) {
        this.getEventDate(eventId, onDate);
    },

    handleToggleEdit: function(e) {
        if (e) {
            e.preventDefault();
        }
        this.setState({isEditing: !this.state.isEditing});
    },

    refreshData: function() {
        this.setState({isEditing: false});
        this.getEventDate(this.state.model.id, this.state.onDate);
    },

    renderRota: function() {
        if (this.state.isEditing) {
            return (
                <EventDetailRotaEdit model={this.state.model} onDate={this.state.onDate}
                                     summary={this.state.dateSummary} rota={this.state.rota}
                                     canAdministrate={this.canAdministrate()} refreshData={this.refreshData}
                                     toggleEdit={this.handleToggleEdit} roles={this.state.roles} />
            );
        } else {
            return (
                <EventDetailRota onDate={this.state.onDate} summary={this.state.dateSummary} rota={this.state.rota}
                                 canAdministrate={this.canAdministrate()} toggleEdit={this.handleToggleEdit}/>
            );
        }
    },

    render: function () {
        return (
            <div id="main" className="container-fluid" role="main">
                <h2 className="heading center">{this.state.model.name}</h2>
                <h4 className="center"><a href={'/rota/events/'.concat(this.state.model.id, '/overview')}>Overview</a></h4>

                <div className="col-md-4 col-sm-4 col-xs-12">
                    <EventDetailDates eventDates={this.state.dates} canAdministrate={this.canAdministrate()}
                                      model={this.state.model} onDate={this.state.onDate}
                                      datesLoading={this.state.eventDatesLoading} />
                    <EventDetailPanel model={this.state.model} />
                </div>

                {this.renderRota()}
            </div>
        );
    }

});

module.exports = EventDetail;

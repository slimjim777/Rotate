import React, { Component } from 'react';
var EventModel = require('../models/event');
var SongModel = require('../models/song');
var Person = require('../models/person');
var EventDate = require('../models/eventdate');
var $ = require('jquery');
var EventDetailPanel = require('../components/EventDetailPanel');
var EventDetailRota = require('../components/EventDetailRota');
var EventDetailRotaEdit = require('../components/EventDetailRotaEdit');
var EventDetailDates = require('../components/EventDetailDates');
var EventDateAdd = require('../components/EventDateAdd');
var Navigation = require('../components/Navigation');
var DialogConfirm = require('../components/DialogConfirm');


class EventDetail extends Component {

    getInitialState() {
        return ({eventLoading: false, model: {}, onDate: null, eventDate: {},
          dateSummary: {}, rota: [], roles: [], showEventAdd: false,
          eventDatesLoading: false, dates: [], user: null, isEditing: false,
          showEventDelete: false});
    }

    componentDidMount () {
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
    }

    componentWillUnmount () {
        $(document).off('dateTransition', this.handleDateChange);
    }

    getPermissions () {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            self.setState({user: user});
        });
    }

    canAdministrate() {
        if (!this.state.user) {
            return false;
        }
        if (this.state.user.role === 'admin') {
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
    }

    getEvent(modelId) {
        var self = this;
        self.setState({eventLoading: true });
        EventModel.findById(modelId).then(function(response) {
            var data = JSON.parse(response.body);
            self.setState({model: data.event, eventLoading: false });
        });
    }

    getEventDates(modelId) {
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
    }

    getEventDate(modelId, onDate) {
        var self = this;
        self.setState({eventDateLoading: true, onDate: onDate});
        EventDate.findByDate(modelId, onDate).then(function(response) {
            var data = JSON.parse(response.body).event_date;
            self.setState({
                dateSummary: data.summary, rota: data.rota, roles: data.roles, onDate: onDate,
                eventDateLoading: false });
            self.setlistExists(modelId, onDate);
        });
    }

    // Checks if set list exists and if the user has permissions to see it
    setlistExists(eventId, onDate) {
      var self = this;
      SongModel.setlistExists(eventId, onDate).then(function(response) {
        var data = JSON.parse(response.body);
        self.setState({setlistExists: data.exists});
      });
    }

    handleAddEventDate(e) {
      e.preventDefault();

      this.setState({showEventAdd: !this.state.showEventAdd});
    }

    handleAddEventDateSave(eventDate) {
      this.setState({showEventAdd: false});
      window.location.href = '/rota/events/' + this.props.params.id + '/' + eventDate;
    }

    handleDateChange(e, eventId, onDate) {
        this.getEventDate(eventId, onDate);
    }

    handleDelete(e) {
      this.setState({showEventDelete: !this.state.showEventDelete});
    }

    handleDeleteConfirm(e) {
      var self = this;

      EventModel.deleteDate(this.props.params.id, this.state.onDate).then(function(response) {
        self.setState({showEventDelete: false});
        window.location.href = '/rota/events/' + self.props.params.id;
      });
    }

    handleToggleEdit(e) {
        if (e) {
            e.preventDefault();
        }
        this.setState({isEditing: !this.state.isEditing});
    }

    refreshData() {
        this.setState({isEditing: false});
        this.getEventDate(this.state.model.id, this.state.onDate);
    }

    renderConfirmDelete() {
      if (this.state.showEventDelete) {
        return (
          <DialogConfirm title={'Confirm Event Date Deletion'} messages={['Are you sure want to remove this event date?']}
            onClickSave={this.handleDeleteConfirm} onClickCancel={this.handleDelete} />
        );
      }
    }

    renderEventDate() {
      if (this.state.showEventAdd) {
        return (
          <EventDateAdd eventId={this.props.params.id}
            onClickSave={this.handleAddEventDateSave} onClickCancel={this.handleAddEventDate} />
        );
      }
    }

    renderRota() {
        if (this.state.isEditing) {
            return (
                <EventDetailRotaEdit model={this.state.model} onDate={this.state.onDate}
                                     summary={this.state.dateSummary} rota={this.state.rota}
                                     canAdministrate={this.canAdministrate()} refreshData={this.refreshData}
                                     toggleEdit={this.handleToggleEdit} roles={this.state.roles}
                                     handleDelete={this.handleDelete} />
            );
        } else {
            return (
                <EventDetailRota model={this.state.model} onDate={this.state.onDate}
                                 summary={this.state.dateSummary} rota={this.state.rota}
                                 canAdministrate={this.canAdministrate()} toggleEdit={this.handleToggleEdit}
                                 handleDelete={this.handleDelete} user={this.state.user}
                                 setlistExists={this.state.setlistExists} />
            );
        }
    }

    render () {
        return (
            <div id="main" className="container-fluid" role="main">
                <Navigation active="events" />
                <h2 className="heading center">{this.state.model.name}</h2>
                <h4 className="center"><a href={'/rota/events/'.concat(this.state.model.id, '/overview')}>Overview</a></h4>
                {this.renderEventDate()}
                {this.renderConfirmDelete()}

                <div className="col-md-4 col-sm-4 col-xs-12">
                    <EventDetailDates eventDates={this.state.dates} canAdministrate={this.canAdministrate()}
                                      model={this.state.model} onDate={this.state.onDate}
                                      addEventDate={this.handleAddEventDate}
                                      datesLoading={this.state.eventDatesLoading} />
                    <EventDetailPanel model={this.state.model} />
                </div>

                {this.renderRota()}
            </div>
        );
    }

}

export default EventDetail;

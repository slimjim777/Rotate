'use strict';
var React = require('react');
var moment = require('moment');
var $ = require('jquery');


var EventDetailDates = React.createClass({

    renderSpinner: function() {
        if (this.props.datesLoading) {
            return (
                <label className="spinner">&nbsp;</label>
            );
        }
    },

    renderActions: function() {
        if (this.props.canAdministrate) {
            return (
                <button id="create-event-dates" className="btn btn-primary"
                        data-toggle="modal" data-target="#dialog-form" title="New Event Dates">
                    <span className="glyphicon glyphicon-plus"></span>
                </button>
            );
        }
    },

    handleClick: function(eventId, onDate) {
        $(document).trigger('dateTransition', [eventId, onDate]);
    },

    render: function() {
        var self = this;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        {this.renderSpinner()}
                        Dates
                    </h3>
                </div>
                <div className="panel-body">
                    <div>
                        {this.props.eventDates.map(function(ed) {
                            var link = '/rota/events/' + self.props.model.id + '/' + ed.on_date;
                            var buttonClass = 'btn btn-primary btn-sm';
                            if (self.props.onDate === ed.on_date) {
                                buttonClass += ' active';
                            }
                            return (
                                <a href={link} key={ed.id} className={buttonClass} title="View Rota"
                                   onClick={self.handleClick.bind(self, self.props.model.id, ed.on_date)}>
                                    {moment(ed.on_date).format('DD/MM/YYYY')}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = EventDetailDates;

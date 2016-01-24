'use strict';
var React = require('react');
var Person = require('../models/person');
var Dialog = require('../components/Dialog');
var moment = require('moment');

var MESSAGES = [
    'Nada, zilch, nothing to display.',
    "Dude, you've got nothing to do!",
    "So, your diary is free - want to meet for coffee?",
    "Nothing to see here, move along."
  ];


var Rota = React.createClass({
    getInitialState: function () {
        return {
            dialogTitle: '', dialogMessages: '', showModal: false
        };
    },

    handleHelpMeSwap: function(r) {
      var names = r.available_people.map(function(person) {
        return person.name + " (" + person.email + ")"
      });
      var messages = names;
      this.setState({dialogTitle: 'People Available for the Role', dialogMessages: messages, showModal: true});
    },

    handleCloseDialog: function() {
      this.setState({showModal: false});
    },

    renderSpinner: function() {
        if (this.props.isLoading) {
            return (
                <label id="person-rota-spinner" className="spinner">&nbsp;</label>
            );
        }
    },

    renderSwaps: function(people) {

    },

    renderIsAway: function(r) {
      var self = this;
      var button = null;

      if (this.props.canAdministrate) {
        button = (<div>
                  <button onClick={self.handleHelpMeSwap.bind(self, r)} className="btn btn-danger">Help me swap</button>
                 </div>);
      }

      if (r.is_away) {
        return (
          <div>
            <span className="alert-danger" title="You are away for this date. Please arrange a swap.">{moment(r.on_date).format('DD/MM/YYYY')}</span>
            {button}
          </div>
        )
      } else {
        return (
          <span>{moment(r.on_date).format('DD/MM/YYYY')}</span>
        )
      }
    },

    renderTable: function() {
        var index = 0;
        var indexEvent = 0;
        var indexRole = 0;
        var self = this;
        if (this.props.rota.length > 0) {
            return (
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Date</th><th>Event</th>
                    </tr>
                    </thead>
                    <tbody>
                    {self.props.rota.map(function(rota) {
                      index += 1;
                      return (
                        <tr key={index}>
                          <td>{self.renderIsAway(rota)}</td>
                          <td>
                          {rota.events.map(function(evt) {
                            var eventLink = '/rota/events/' + evt.event_id + '/' + rota.on_date.substring(0,10);
                            indexEvent += 1;
                            return (
                              <div key={indexEvent}>
                                <a href={eventLink}>{evt.event}</a>
                                <div>
                                  {evt.roles.map(function(role) {
                                      indexRole += 1;
                                      return (<span className="label label-default" key={indexRole}>{role.name}</span>);
                                  })}
                                </div>
                              </div>
                            )
                          })}
                          </td>
                        </tr>
                      )
                    })}
                    </tbody>
                </table>
            );
        } else {
            return <p>{MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}</p>;
        }
    },

    renderDialog: function() {
      if (this.state.showModal) {
        return <Dialog title={this.state.dialogTitle} messages={this.state.dialogMessages} onClick={this.handleCloseDialog}/>;
      }
    },

    render: function () {

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        {this.renderSpinner()}Rota&nbsp;
                        <button className="btn" title="Previous weeks" onClick={this.props.rangeMinus}>
                            <span className="glyphicon glyphicon-arrow-left"></span>
                        </button>
                        <button className="btn" title="Next weeks" onClick={this.props.rangePlus}>
                            <span className="glyphicon glyphicon-arrow-right"></span>
                        </button>
                        <button className="btn" title="Refresh Rota" onClick={this.props.rotaRefreshClick}>
                            <span className="glyphicon glyphicon-refresh"></span>
                        </button>
                    </h3>
                </div>
                <div className="panel-body table-responsive" id="person-rota">
                    <em>{this.props.rangeMessage}</em>
                    {this.renderTable()}
                    {this.renderDialog()}
                </div>
            </div>
        );
    }

});

module.exports = Rota;

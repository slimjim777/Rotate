'use strict';
var React = require('react');
var EventModel = require('../models/event');
var Modal = require("react-bootstrap").Modal;
var Button = require("react-bootstrap").Button;
import Pikaday from 'react-pikaday';
var moment = require('moment');


var EventDateAdd = React.createClass({

  getInitialState: function() {
    return {
      eventDate: moment(this.props.eventDate, 'YYYY-MM-DD').toDate()
    }
  },

  handleChangeEventDate: function(date) {
    this.setState({eventDate: date})
  },

  handleSave: function(e) {
    e.preventDefault();
    var self = this;

    var eventDate = moment(this.state.eventDate).format('YYYY-MM-DD');
    EventModel.addDate(this.props.eventId, eventDate).then(function(response) {
      self.props.onClickSave(eventDate);
    });
  },

  renderMessage: function() {
    if (this.props.message) {
      return (
        <div className="alert alert-danger">
          {this.props.message}
        </div>
      )
    }
  },

  render: function() {
    return (
      <div>
        <Modal.Dialog>
          <Modal.Header>
              <Modal.Title>Add Additional Event Date</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <p><em>Click the date entry box to select an event date to create.</em></p>
              <label>Rota Date:&nbsp;</label>
              <Pikaday value={this.state.eventDate} onChange={this.handleChangeEventDate} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleSave} bsStyle="primary">Save</Button>
            <Button onClick={this.props.onClickCancel}>Cancel</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    );
  }
});

module.exports = EventDateAdd;

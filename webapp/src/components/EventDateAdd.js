import React, { Component } from 'react';
import EventModel from '../models/event';
import {Modal} from "react-bootstrap";
import {Button} from "react-bootstrap";
import Pikaday from 'react-pikaday-datepicker';
import moment from 'moment';


class EventDateAdd extends Component {

  constructor(props) {
      super(props)
      this.state = {
          eventDate: moment(this.props.eventDate, 'YYYY-MM-DD').toDate()
      }
  }

  handleChangeEventDate(date) {
    this.setState({eventDate: date})
  }

  handleSave(e) {
    e.preventDefault();
    var self = this;

    var eventDate = moment(this.state.eventDate).format('YYYY-MM-DD');
    EventModel.addDate(this.props.eventId, eventDate).then(function(response) {
      self.props.onClickSave(eventDate);
    });
  }

  renderMessage() {
    if (this.props.message) {
      return (
        <div className="alert alert-danger">
          {this.props.message}
        </div>
      )
    }
  }

  render() {
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
}

export default EventDateAdd;

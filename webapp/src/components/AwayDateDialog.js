import React, { Component } from 'react';
import Pikaday from 'react-pikaday-datepicker';
var Button = require("react-bootstrap").Button;
var moment = require('moment');


class AwayDateDialog extends Component {

  getInitialState() {
    return {awayId: this.props.awayId,
      fromDate: moment(this.props.fromDate, 'YYYY-MM-DD').toDate(),
      toDate: moment(this.props.toDate, 'YYYY-MM-DD').toDate()}
  }

  handleChangeFromDate(date) {
    this.setState({fromDate: date})
  }

  handleChangeToDate(date) {
    this.setState({toDate: date})
  }

  handleSave(e) {
    e.preventDefault();

    var fromDate = moment(this.state.fromDate).format('YYYY-MM-DD');
    var toDate = moment(this.state.toDate).format('YYYY-MM-DD');
    this.props.onClickSave({id: this.state.awayId, from_date: fromDate, to_date: toDate});
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
      <div className="panel panel-info">
        <div className="panel-heading">
          {this.props.title}
        </div>
        <div className="panel-body">
            <div>
              {this.renderMessage()}
              <p><em>Click the date entry box to select a date.</em></p>
              <input type="hidden" name="id" value={this.state.awayId} className="form-control" />
              <label>From Date:&nbsp;</label>
              <Pikaday value={this.state.fromDate} onChange={this.handleChangeFromDate} />
              &nbsp;
              <label>To Date:&nbsp;</label>
              <Pikaday value={this.state.toDate} onChange={this.handleChangeToDate} />
            </div>

            <div>
              <Button onClick={this.handleSave} bsStyle="primary">Save</Button>
              <Button onClick={this.props.onClickCancel}>Cancel</Button>
            </div>
        </div>
      </div>
    )
  }
}

export default AwayDateDialog;

import React, { Component } from 'react';
import moment from 'moment';


class EventDetailRota extends Component {

    constructor(props) {
      super(props)
      this.state = {showRunsheet: false, user: {}};
    }

    toggleRunsheet() {
      this.setState({showRunsheet: !this.state.showRunsheet});
    }

    renderActions() {
        if (this.props.canAdministrate) {
            return (
                <span>
                    <button className="btn btn-primary" onClick={this.props.toggleEdit}>Edit</button>&nbsp;
                    <button className="btn btn-default" onClick={this.props.handleDelete} title="Delete event date" >
                      <span className="glyphicon glyphicon-remove" onClick={this.props.handleDelete}></span>
                    </button>
                </span>
            );
        }
    }

    renderRunSheetLink(summary) {
        if (summary.url) {
            return (
                <a href={summary.url}>
                    external link for {moment(summary.on_date).format('DD/MM/YYYY')}
                </a>
            );
        }
    }

    renderViewRunsheetButton() {
      var self = this;
      var summary = this.props.summary;
      var eventId;
      // Link to the parent event, if there is one
      if (this.props.model.parent_event) {
        eventId = this.props.model.parent_event;
      } else {
        eventId = this.props.model.id;
      }
      return (
        <span>
          <a className="btn btn-primary" href={'/events/'.concat(eventId, '/', summary.on_date, '/runsheet')}>View</a>
          &nbsp;
          {self.renderViewSetListButton(eventId, summary.on_date)}
        </span>
      )
    }

    renderViewSetListButton(eventId, onDate) {
      if (this.props.setlistExists) {
        return (
          <a className="btn btn-primary" href={'/rota/events/'.concat(eventId, '/', onDate, '/setlist')}>Set List</a>
        );
      }
    }

    renderName(r) {
      if (r.is_away) {
        return (
          <span className="alert-danger" title="Away, swap needed">
            {r.firstname} {r.lastname}
          </span>
        );
      } else if (r.on_rota) {
        return (
          <span className="alert-warning" title="On rota for another team">
            {r.firstname} {r.lastname}
          </span>
        );
      } else {
        return (
          <span>{r.firstname} {r.lastname}</span>
        );
      }
    }

    render () {
        var summary = this.props.summary;
        var rota = this.props.rota;

        if (!this.props.onDate) {
            return (
                <div>Select a date to display the rota.</div>
            );
        }

        var index = 0;
        var self = this;
        return (
            <div className="col-md-8 col-sm-8 col-xs-12">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 className="sub-heading">
                            {this.renderActions()}
                            On {moment(summary.on_date).format('DD/MM/YYYY')}</h4>
                    </div>
                    <div className="panel-body">
                        <div>
                            <label>Focus</label>
                            <div>{summary.focus}</div>
                        </div>
                        <div>
                            <label>Notes</label>
                            <div>{summary.notes}</div>
                        </div>
                        <div>
                            <label>Run Sheet</label>&nbsp;
                            <span>{this.renderRunSheetLink(summary)}&nbsp;{this.renderViewRunsheetButton()}</span>
                            {/*this.renderRunSheet(model, summary)*/}
                        </div>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Role</th><th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                            {rota.map(function(r) {
                                index += 1;
                                return (
                                    <tr key={index}>
                                        <td>{r.role_name}</td>
                                        <td>
                                            <a href={'/rota/person/' + r.person_id}>{self.renderName(r)}</a>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default EventDetailRota;

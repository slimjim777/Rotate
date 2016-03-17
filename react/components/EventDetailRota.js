'use strict';
var React = require('react');
var moment = require('moment');


var EventDetailRota = React.createClass({

    renderActions: function() {
        if (this.props.canAdministrate) {
            return (
                <span>
                    <button className="btn btn-primary" onClick={this.props.toggleEdit}>Edit</button>&nbsp;
                    <button className="btn btn-default" onClick={this.props.handleDelete} title = "Delete event date" >
                      <span className="glyphicon glyphicon-remove" onClick={this.props.handleDelete}></span>
                    </button>
                </span>
            );
        }
    },

    renderRunSheet: function(summary) {
        if (summary.url) {
            return (
                <a href={summary.url}>
                    Run Sheet on {moment(summary.on_date).format('DD/MM/YYYY')}
                </a>
            );
        }
    },

    renderName: function(r) {
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
    },

    render: function () {
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
                            <label>Run Sheet</label>
                            <div>{this.renderRunSheet(summary)}</div>
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
});

module.exports = EventDetailRota;

import React, { Component } from 'react';
var Navigation = require('../components/Navigation');
var RunsheetTemplates = require('../components/RunsheetTemplates');
var EventModel = require('../models/event');
var moment = require('moment');


var RANGE = 12;


class RunsheetList extends Component {

    getInitialState() {
      return {sheets: [], runsheetRange: RANGE};
    }

    componentDidMount() {
      this.getRunsheets();
    }

    getRunsheets() {
      var self = this;
      EventModel.runsheets(this.state.runsheetRange).then(function(response) {
        var data = JSON.parse(response.body);
        self.setState({sheets: data.sheets});
      });
    }

    handleRangePlus() {
      var range = this.state.runsheetRange + RANGE;
      if (range === 0) {range = RANGE;}
      this.setState({runsheetRange: range} this.getRunsheets);
    }

    handleRangeMinus() {
      var range = this.state.runsheetRange - RANGE;
      if (range === 0) {range = -RANGE;}
      this.setState({runsheetRange: range} this.getRunsheets);
    }

    renderRangeMessage () {
        if (this.state.runsheetRange === RANGE) {return;}
        if (this.state.runsheetRange > 0) {
            return 'Next ' + (this.state.runsheetRange - RANGE) + ' to ' + this.state.runsheetRange + ' weeks';
        } else {
            return 'Previous ' + Math.abs(this.state.runsheetRange + RANGE) + ' to ' + (-this.state.runsheetRange) + ' weeks';
        }
    }

    render() {
      return (
        <div id="main" className="container-fluid" role="main">
            <Navigation active="runsheets" />
            <h2>Run Sheets</h2>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                      Run Sheets&nbsp;
                      <button className="btn" title="Previous weeks" onClick={this.handleRangeMinus}>
                          <span className="glyphicon glyphicon-arrow-left"></span>
                      </button>
                      <button className="btn" title="Next weeks" onClick={this.handleRangePlus}>
                          <span className="glyphicon glyphicon-arrow-right"></span>
                      </button>
                    </h3>
                </div>
                <div className="panel-body table-responsive">
                    <em>{this.renderRangeMessage()}</em>
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Date</th><th>Event</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.sheets.map(function(sh) {
                            var url = '/rota/events/' + sh.event_id + '/'+ sh.on_date + '/runsheet';
                            return (
                                <tr key={sh.id}>
                                    <td><a href={url}>{moment(sh.on_date).format('DD/MM/YYYY')}</a></td><td><a href={url}>{sh.event_name}</a></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
            <br />
            <RunsheetTemplates canAdministrate/>
        </div>
      );
    }

}

export default RunsheetList;

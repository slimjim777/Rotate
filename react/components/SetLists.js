'use strict';
var React = require('react');
var Navigation = require('../components/Navigation');
var SongModel = require('../models/song');

const RANGE = 12;

var SetLists = React.createClass({
  getInitialState: function() {
    return {setlists: [], range: RANGE};
  },

  componentDidMount: function() {
    this.getSetlists();
  },

  getSetlists: function() {
    var self = this;
    SongModel.setlists(this.state.range).then(function(response) {
      var data = JSON.parse(response.body);
      self.setState({setlists: data.setlists});
    });
  },

  renderRangeMessage: function () {
      if (this.state.range === RANGE) {return;}
      if (this.state.range > 0) {
          return 'Next ' + (this.state.range - RANGE) + ' to ' + this.state.range + ' weeks';
      } else {
          return 'Previous ' + Math.abs(this.state.range + RANGE) + ' to ' + (-this.state.range) + ' weeks';
      }
  },

  handleRangePlus: function() {
    var range = this.state.range + RANGE;
    if (range === 0) {range = RANGE;}
    this.setState({range: range}, this.getSetlists);
  },

  handleRangeMinus: function() {
    var range = this.state.range - RANGE;
    if (range === 0) {range = -RANGE;}
    this.setState({range: range}, this.getSetlists);
  },

  render: function () {
      return (
          <div id="main" className="container-fluid" role="main">
              <Navigation active="setlists" />
              <h2>Set Lists&nbsp;
                <a className="btn" href="/rota/setlists/new"><span className="glyphicon glyphicon-plus"></span></a>
              </h2>

              <div className="panel panel-default">
                  <div className="panel-heading">
                      <h3 className="panel-title">
                        Set Lists&nbsp;
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
                          {this.state.setlists.map(function(sl) {
                              var url = '/rota/events/' + sl.event_id + '/'+ sl.on_date + '/setlist';
                              return (
                                  <tr key={sl.id}>
                                      <td><a href={url}>{sl.on_date}</a></td><td><a href={url}>{sl.event_name}</a></td>
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

module.exports = SetLists;

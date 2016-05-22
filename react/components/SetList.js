'use strict'
var React = require('react');
var Navigation = require('../components/Navigation');
var SetListDetail = require('../components/SetListDetail');
var SongModel = require('../models/song');
var Person = require('../models/person');
import Pikaday from 'react-pikaday';
var moment = require('moment');


var DEFAULT_SETLIST = {rows: []};


var SetList = React.createClass({
  getInitialState: function() {
    return {setlist: DEFAULT_SETLIST, message: null, events: [], user: {}, onDate: moment().toDate()};
  },

  componentDidMount: function() {
    this.getPermissions();
    this.getSetList();
  },

  getPermissions: function () {
      var self = this;
      Person.permissions().then(function(response) {
          var user = JSON.parse(response.body).permissions;
          var canAdministrate = false;
          if ((user.music_role === 'standard') || (user.music_role === 'admin')) {
            canAdministrate = true;
          }

          self.setState({user: user, canAdministrate: canAdministrate});
      });
  },

  getSetList: function() {
      var self = this;
      SongModel.setlist(this.props.params.id, this.props.params.onDate).then(function(response) {
          var data = JSON.parse(response.body);
          if (!data.setlist.rows) {
            data.setlist.rows = [];
          }
          self.setState({setlist: data.setlist});
      });
  },

  updateSetList: function(setlist) {
    return SongModel.upsertSetList(this.props.params.id, this.props.params.onDate, setlist);
  },

  renderSetList: function(setlist) {
    if (this.state.user.music_role) {
      return (
        <SetListDetail setlist={this.state.setlist} canAdministrate={this.state.canAdministrate}
          updateSetList={this.updateSetList} refreshSetList={this.getSetList}
          changeRowField={this.changeRowField} />
      );
    } else {
      return (
        <div>
          You do not have permissions to view the set list.
        </div>
      )
    }
  },

  renderRunsheetLink: function(setlist) {
    if (setlist.url) {
      return (
        <a href={setlist.url}>external runsheet</a>
      );
    }
  },

  renderDetails: function(setlist) {
    var eventId = this.props.params.id;
    var onDate = this.props.params.onDate;


    return (
      <div className="panel panel-default">
        <div className="panel-heading">
            <h3 className="panel-title">{setlist.event_name} on {onDate}</h3>
        </div>
        <div className="panel-body">
          <div>
              <label>Date</label>
              <div>
                <a href={'/rota/events/' + eventId + '/' + onDate} title="View Event Date">{moment(onDate).format('DD/MM/YYYY')}</a>
                &nbsp;(<a href={'/rota/events/' + eventId + '/overview'} title="View Event Overview">Overview</a>)
              </div>
          </div>
          <div>
              <label>Focus</label>
              <div>{setlist.focus}</div>
          </div>
          <div>
              <label>Notes</label>
              <div>{setlist.notes}</div>
          </div>
          <div>
              <label>
                Run Sheet
                &nbsp;
                {this.renderRunsheetLink(setlist)}
                <a href={'/rota/events/'.concat(this.props.params.id, '/', this.props.params.onDate, '/runsheet')} className="btn">View</a>
              </label>
          </div>
        </div>
      </div>
    );


  },

  render: function() {
    var setlist = this.state.setlist;

    return (
      <div id="main" className="container-fluid" role="main">
          <Navigation active="setlists" />
          <h2>Set List</h2>

          {this.renderDetails(setlist)}
          {this.renderSetList(setlist)}

      </div>
    );

  }

});

module.exports = SetList;

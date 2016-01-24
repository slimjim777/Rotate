'use strict';
var React = require('react');
var Person = require('../models/person');
var AwayDateDialog = require('../components/AwayDateDialog');
var moment = require('moment');


var AwayDates = React.createClass({
    getInitialState: function () {
        return {
            showModal: false, away: {}
        };
    },

    addClick: function(e) {
      e.preventDefault();
      this.setState({showModal: true, away: {title: 'New Away Date'}});
    },

    deleteClick: function(away) {
      var self = this;
      Person.deleteAwayDate(this.props.personId, away).then(function(response) {
        var data = JSON.parse(response.body);
        self.props.awayRefreshClick();
      });
    },

    editClick: function(away) {
      var a = {
        title: 'Edit Away Date', id: away.id,
        from_date: away.from_date, to_date: away.to_date
      }
      this.setState({showModal: true, away: a});
    },

    handleAwaySave: function(away) {
      var self = this;
      Person.upsertAwayDate(this.props.personId, away).then(function(response) {
        var data = JSON.parse(response.body);
        if (data.response != 'Success') {
          var a = self.state.away;
          a.message = data.message;
          self.setState({away: a});
        } else {
          self.props.awayRefreshClick();
          self.setState({showModal: false, away: {}});
        }
      });
    },

    handleAwayCancel: function(e) {
      this.setState({showModal: false});
    },

    renderSpinner: function() {
        if (this.props.isLoading) {
            return (
                <label id="person-rota-spinner" className="spinner">&nbsp;</label>
            );
        }
    },

    renderTable: function() {
        var self = this;
        if (this.props.awayDates.length > 0) {
            return (
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th></th><th>From Date</th><th>To Date</th><th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.awayDates.map(function(away) {
                        return (
                            <tr key={away.id}>
                                <td><button onClick={self.editClick.bind(self, away)} className="btn btn-default">Edit</button></td>
                                <td>{moment(away.from_date).format('DD/MM/YYYY')}</td>
                                <td>{moment(away.to_date).format('DD/MM/YYYY')}</td>
                                <td><button onClick={self.deleteClick.bind(self, away)} className="btn btn-link"><span className="glyphicon glyphicon-remove-circle"></span></button></td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            );
        } else {
            return <p>No away dates found.</p>;
        }
    },

    renderAdd: function() {
      if (this.props.canAdministrate) {
        return (
          <button className="btn" title="Previous weeks" onClick={this.addClick}>
              <span className="glyphicon glyphicon-plus"></span>
          </button>
        )
      }
    },

    renderAwayDateDialog: function() {
      if (this.state.showModal) {
        return (<AwayDateDialog awayId={this.state.away.id} fromDate={this.state.away.fromDate} toDate={this.state.away.toDate}
                  title={this.state.away.title} message={this.state.away.message}
                  fromDate={this.state.away.from_date} toDate={this.state.away.to_date}
                  onClickSave={this.handleAwaySave} onClickCancel={this.handleAwayCancel}/>);
      }
    },

    render: function () {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        {this.renderSpinner()}Away Dates&nbsp;
                        {this.renderAdd()}
                        <button className="btn" title="Previous weeks" onClick={this.props.rangeMinus}>
                            <span className="glyphicon glyphicon-arrow-left"></span>
                        </button>
                        <button className="btn" title="Next weeks" onClick={this.props.rangePlus}>
                            <span className="glyphicon glyphicon-arrow-right"></span>
                        </button>
                        <button className="btn" title="Refresh Rota" onClick={this.props.awayRefreshClick}>
                            <span className="glyphicon glyphicon-refresh"></span>
                        </button>
                    </h3>
                </div>
                <div className="panel-body table-responsive" id="person-rota">
                    <em>{this.props.rangeMessage}</em>
                    {this.renderAwayDateDialog()}
                    {this.renderTable()}
                </div>
            </div>
        );
    }
});

module.exports = AwayDates;

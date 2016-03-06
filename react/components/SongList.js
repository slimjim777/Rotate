'use strict';
var React = require('react');
var Person = require('../models/person');


var SongList = React.createClass({

    getInitialState: function() {
        return ({isEditing: false, personId: null, isAdmin: false});
    },

    componentDidMount: function () {
      this.getPermissions();
    },

    getPermissions: function () {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            self.setState({user: user, isAdmin: user.is_admin});
        });
    },

    renderActive: function(active) {
        if (active) {
            return (
                <span className="glyphicon glyphicon-ok"></span>
            );
        }
    },

    renderHeader: function () {
        if (this.state.isAdmin) {
            return (
                <thead>
                    <tr>
                        <th className="left-align">Name</th><th>Active</th><th>YouTube</th><th>Tempo</th><th>Time Signature</th>
                    </tr>
                </thead>
            );
        } else {
            return (
                <thead>
                    <tr>
                        <th className="left-align">Name</th><th>Active</th><th>YouTube</th><th>Tempo</th><th>Time Signature</th>
                    </tr>
                </thead>
            );
        }
    },

    renderURL: function(song) {
      if (song.url) {
        return (
          <a href={song.url} className="btn btn-primary">YouTube</a>
        );
      }
    },

    render: function() {
        var self = this;

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Songs</h3>
                </div>
                <div className="panel-body table-responsive">
                    <div>

                    </div>

                    <div className="table-responsive">
                        <div className="col-xs-12 col-md-12 col-lg-12"><p>{this.props.songs.length} records.</p></div>
                        <table className="table table-striped">
                            {this.renderHeader()}
                            <tbody>
                            {this.props.songs.map(function(p) {
                                return (
                                    <tr key={p.id}>
                                        <td className="left-align"><a href={'/rota/songs/' + p.id}>{p.name}</a></td>
                                        <td>{self.renderActive(p.active)}</td>
                                        <td>{self.renderURL(p)}</td>
                                        <td>{p.tempo}</td>
                                        <td>{p.time_signature}</td>
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

module.exports = SongList;

'use strict';
var React = require('react');
var Person = require('../models/person');

var STATUSES = [{name:'Active', value:'active'}, {name:'Inactive', value:'inactive'}, {name:'Both', value:'both'}];

var SongList = React.createClass({

    getInitialState: function() {
        return ({isEditing: false, personId: null, isAdmin: false, search: '', findStatus: 'active'});
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

    handleSubmit: function(e) {
        e.preventDefault();
        this.props.onFilterChange(this.state.search, this.state.findStatus);
    },

    handleClearForm: function(e) {
      e.preventDefault();
      this.setState({search: '', findStatus: 'active'});
      this.props.onFilterChange('', 'active');
    },

    handleChangeStatus: function(e) {
        e.preventDefault();
        this.setState({findStatus: e.target.value});
        this.props.onFilterChange(this.state.search, e.target.value);
    },

    handleChangeSearch: function(e) {
        e.preventDefault();
        this.setState({search: e.target.value});
        this.props.onFilterChange(e.target.value, this.state.findStatus);
    },

    handleKeyUp: function(e) {
      if (e.keyCode === 13) {
        this.props.findSongs(this.state.search);
      }
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
                        <div className="form-group info">
                            <p>Find</p>
                            <form role="form" onSubmit={this.handleSubmit}>
                                <div className="col-xs-6 col-md-6 col-lg-6">
                                    <input text="search" value={this.state.search} onChange={this.handleChangeSearch}
                                           placeholder="find song" className="form-control" onKeyUp={this.handleKeyUp} />
                                </div>
                                <div className="col-xs-3 col-md-3 col-lg-3">
                                    <select name="status" className="form-control" onChange={this.handleChangeStatus} value={this.state.findStatus}>
                                        {STATUSES.map(function(st) {
                                            return (
                                                <option key={st.value} value={st.value}>{st.name}</option> );
                                        })}
                                    </select>
                                </div>
                                <div className="col-xs-3 col-md-3 col-lg-3">
                                    <button className="btn btn-default" title="Clear search" onClick={this.handleClearForm}><span className="glyphicon glyphicon-remove-circle"></span></button>
                                </div>
                            </form>
                        </div>
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

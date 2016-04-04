'use strict';
var React = require('react');
var STATUSES = [{name:'Active', value:'active'}, {name:'Inactive', value:'inactive'}, {name:'Both', value:'both'}];

var PeopleFilter = React.createClass({

    getInitialState: function() {

        return ({findFirstname: null, findLastname:null, findStatus: 'active'});
    },

    handleSubmit: function(e) {
        e.preventDefault();
        this.props.onFilterChange(this.state.findFirstname, this.state.findLastname, this.state.findStatus);
    },

    handleClearForm: function(e) {
      e.preventDefault();
      this.setState({findFirstname: null, findLastname:null, findStatus: 'active'});
      this.props.onFilterChange('', '', 'active');
    },

    handleChangeStatus: function(e) {
        e.preventDefault();
        this.setState({findStatus: e.target.value});
        this.props.onFilterChange(this.state.findFirstname, this.state.findLastname, e.target.value);
    },
    handleChangeFirstname: function(e) {
        e.preventDefault();
        this.setState({findFirstname: e.target.value});
        this.props.onFilterChange(e.target.value, this.state.findLastname, this.state.findStatus);
    },
    handleChangeLastname: function(e) {
        e.preventDefault();
        this.setState({findLastname: e.target.value});
        this.props.onFilterChange(this.state.findFirstname, e.target.value, this.state.findStatus);
    },

    render: function() {
        var self = this;

        return (
            <div className="form-group info">
                <p>Find</p>
                <form role="form" onSubmit={this.handleSubmit}>
                    <div className="col-xs-6 col-md-6 col-lg-3">
                        <input text="search" value={this.state.findFirstname} onChange={this.handleChangeFirstname}
                               placeholder="firstname" className="form-control" />
                    </div>
                    <div className="col-xs-6 col-md-6 col-lg-3">
                        <input text="search" value={this.state.findLastname} onChange={this.handleChangeLastname}
                               placeholder="lastname" className="form-control"/>
                    </div>
                    <div className="col-xs-6 col-md-6 col-lg-3">
                        <select name="status" className="form-control" onChange={this.handleChangeStatus} value={this.state.findStatus}>
                            {STATUSES.map(function(st) {
                                return (
                                    <option key={st.value} value={st.value}>{st.name}</option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="col-xs-6 col-md-6 col-lg-3">
                        <button className="btn btn-primary" title="Clear Form" onClick={this.handleClearForm}><span className="glyphicon glyphicon-remove-circle"></span></button>
                    </div>
                </form>
            </div>
        );
    }
});

module.exports = PeopleFilter;

'use strict'
var React = require('react');
var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavbarHeader = require("react-bootstrap/lib/NavbarHeader")
var NavbarBrand = require("react-bootstrap/lib/NavbarBrand")
var NavbarCollapse = require("react-bootstrap/lib/NavbarCollapse")
var NavbarToggle = require("react-bootstrap/lib/NavbarToggle")
var NavItem = require('react-bootstrap').NavItem;
var Person = require('../models/person');

const ROLE_SETLIST = 'set-list'
const ROLE_STANDARD = 'standard'
const ROLE_ADMIN = 'admin'


var Navigation = React.createClass({
    getInitialState: function() {
      return {canAdministrate: false, user: {}};
    },

    componentDidMount: function () {
      this.getPermissions();
    },

    getPermissions: function () {
        var self = this;
        Person.permissions().then(function(response) {
            var user = JSON.parse(response.body).permissions;
            self.setState({user: user, canAdministrate: self.setCanAdministrate(user)});
        });
    },

    setCanAdministrate: function(user) {
        if (user.role === 'admin') {
            return true;
        } else {
            if (user.events_admin.length > 0) {
              return true;
            }
        }
        return false;
    },

    renderMusicLists: function(activeSetLists) {
      if (this.state.user.music_role) {
        return (
          <NavItem eventKey={4} active={activeSetLists} href="/rota/setlists">Set Lists</NavItem>
        );
      }
    },

    renderMusicSongs: function(activeSongs) {
      if ((this.state.user.music_role === ROLE_STANDARD) || (this.state.user.music_role === ROLE_ADMIN)) {
        return (
          <NavItem eventKey={5} active={activeSongs} href="/rota/songs">Songs</NavItem>
        );
      }
    },

    renderAdmin: function(activeAdmin) {
      if (this.state.canAdministrate) {
        return (
          <NavItem eventKey={6} active={activeAdmin} href="/admin">Admin</NavItem>
        );
      }
    },

    render: function() {
        var activeRota = false;
        var activePeople = false;
        var activeEvents = false;
        var activeSetLists = false;
        var activeSongs = false;
        var activeAdmin = false;
        if (this.props.active === 'rota') {
          activeRota = true;
        }
        if (this.props.active === 'people') {
          activePeople = true;
        }
        if (this.props.active === 'events') {
          activeEvents = true;
        }
        if (this.props.active === 'setlists') {
          activeSetLists = true;
        }
        if (this.props.active === 'songs') {
          activeSongs = true;
        }
        if (this.props.active === 'admin') {
          activeAdmin = true;
        }

        return (
          <Navbar inverse>
            <NavbarHeader>
              <NavbarBrand><a href="/rota/me">Team Rota</a></NavbarBrand>
              <NavbarToggle />
            </NavbarHeader>
              <NavbarCollapse eventKey={0}>
                  <Nav navbar>
                      <NavItem eventKey={1} active={activeRota} href="/rota/me">My Rota</NavItem>
                      <NavItem eventKey={2} active={activePeople} href="/rota/people">People</NavItem>
                      <NavItem eventKey={3} active={activeEvents} href="/rota/events">Events</NavItem>
                      {this.renderMusicLists(activeSetLists)}
                      {this.renderMusicSongs(activeSongs)}
                      {this.renderAdmin(activeAdmin)}
                      <NavItem eventKey={7} href="https://accounts.google.com">{this.state.user.name}</NavItem>
                  </Nav>
              </NavbarCollapse>
          </Navbar>
        );
    }
});

module.exports = Navigation;

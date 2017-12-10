import React, { Component } from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import NavbarHeader from "react-bootstrap/lib/NavbarHeader"
import NavbarBrand from "react-bootstrap/lib/NavbarBrand"
import NavbarCollapse from "react-bootstrap/lib/NavbarCollapse"
import NavbarToggle from "react-bootstrap/lib/NavbarToggle"


//const ROLE_SETLIST = 'set-list'
const ROLE_STANDARD = 'standard'
const ROLE_ADMIN = 'admin'


class Navigation extends Component {

    constructor(props) {
        super(props)
        this.state = {
            canAdministrate: false,
        };
    }

    setCanAdministrate(user) {
        if (user.role === 'admin') {
            return true;
        } else {
            if (user.events_admin.length > 0) {
              return true;
            }
        }
        return false;
    }

    renderMusicLists(activeSetLists) {
      if (this.props.user.music_role) {
        return (
          <NavItem eventKey={5} active={activeSetLists} href="/rota/setlists">Set Lists</NavItem>
        );
      }
    }

    renderMusicSongs(activeSongs) {
      if ((this.props.user.music_role === ROLE_STANDARD) || (this.props.user.music_role === ROLE_ADMIN)) {
        return (
          <NavItem eventKey={6} active={activeSongs} href="/rota/songs">Songs</NavItem>
        );
      }
    }

    renderAdmin(activeAdmin) {
      if (this.state.canAdministrate) {
        return (
          <NavItem eventKey={8} active={activeAdmin} href="/admin">Admin</NavItem>
        );
      }
    }

    render() {
        if (!this.props.user) {
            return <div>Loading...</div>
        }

        var activeRota = false;
        var activePeople = false;
        var activeEvents = false;
        var activeSetLists = false;
        var activeSongs = false;
        var activeAdmin = false;
        var activeRunsheets = false;
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
        if (this.props.active === 'runsheets') {
          activeRunsheets = true;
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
                      <NavItem eventKey={4} active={activeRunsheets} href="/rota/runsheets">Run Sheets</NavItem>
                      {this.renderMusicLists(activeSetLists)}
                      {this.renderMusicSongs(activeSongs)}
                      {this.renderAdmin(activeAdmin)}
                      <NavItem eventKey={9} href="https://accounts.google.com">{this.props.user.name}</NavItem>
                  </Nav>
              </NavbarCollapse>
          </Navbar>
        );
    }
}

export default Navigation;

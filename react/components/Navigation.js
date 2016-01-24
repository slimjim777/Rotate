'use strict'
var React = require('react');
var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavbarHeader = require("react-bootstrap/lib/NavbarHeader")
var NavbarBrand = require("react-bootstrap/lib/NavbarBrand")
var NavbarCollapse = require("react-bootstrap/lib/NavbarCollapse")
var NavItem = require('react-bootstrap').NavItem;

var Navigation = React.createClass({
    render: function() {
        return (
          <Navbar inverse>
            <NavbarHeader>
              <NavbarBrand><a href="/rota/me">Team Rota</a></NavbarBrand>
            </NavbarHeader>
              <NavbarCollapse eventKey={0}>
                  <Nav navbar>
                      <NavItem eventKey={1} href="/rota/me">My Rota</NavItem>
                      <NavItem eventKey={2} href="/rota/people">People</NavItem>
                      <NavItem eventKey={3} href="/rota/events">Events</NavItem>
                  </Nav>
              </NavbarCollapse>
          </Navbar>
        );
    }
});

module.exports = Navigation;

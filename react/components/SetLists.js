'use strict';
var React = require('react');
var Navigation = require('../components/Navigation');


var SetLists = React.createClass({
  render: function () {
      return (
          <div id="main" className="container-fluid" role="main">
              <Navigation active="setlists" />
              <h2>Set Lists</h2>

          </div>
      );
  }
});

module.exports = SetLists;

'use strict';
var Ajax = require('./Ajax');


var Song = {
  url: function() {
      if (sessionStorage.getItem('apiUrl')) {
          return sessionStorage.getItem('apiUrl') + '/api/songs';
      } else {
          return '/api/songs';
      }
  },

  all: function (active) {
      if (!active) {
        active = 'active';
      }
      return Ajax.post(this.url(), {active: active});
  },

  findById: function(songId) {
    return Ajax.get(this.url() + '/' + songId);
  }
}

module.exports = Song;

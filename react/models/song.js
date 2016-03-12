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
  },

  update: function(song) {
      return Ajax.put('/api/songs/' + song.id, {song: song});
  },

  attachments: function(song_id) {
    return Ajax.get('/api/songs/' + song_id + '/attachments');
  }
};

module.exports = Song;

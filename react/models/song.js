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
  },

  attachmentAdd: function(song_id, filename, fileData) {
    return Ajax.post('/api/songs/' + song_id + '/attachments', {filename: filename, data: fileData});
  },

  attachmentDelete: function(song_id, att_id) {
    return Ajax.delete('/api/songs/' + song_id + '/attachments/' + att_id);
  }
};

module.exports = Song;

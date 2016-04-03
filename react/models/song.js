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

  add: function(song) {
      return Ajax.post('/api/songs/new', {song: song});
  },

  attachments: function(song_id) {
    return Ajax.get('/api/songs/' + song_id + '/attachments');
  },

  attachmentAdd: function(song_id, filename, fileData) {
    return Ajax.post('/api/songs/' + song_id + '/attachments', {filename: filename, data: fileData});
  },

  attachmentDelete: function(song_id, att_id) {
    return Ajax.delete('/api/songs/' + song_id + '/attachments/' + att_id);
  },

  setlists: function(range) {
    return Ajax.get('/api/events/setlists', {range: range});
  },

  setlist: function(eventId, on_date) {
    return Ajax.get('/api/events/' + eventId + '/' + on_date + '/setlist');
  },

  setlistExists: function(eventId, on_date) {
    return Ajax.get('/api/events/' + eventId + '/' + on_date + '/setlist_exists');
  },

  upsertSetList: function(eventId, on_date, setlist) {
    return Ajax.post('/api/events/' + eventId + '/' + on_date + '/setlist', {setlist: setlist});
  },

  find: function(q) {
    return Ajax.post('/api/songs/find', {q: q});
  }
};

module.exports = Song;

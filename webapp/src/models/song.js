'use strict';
var Ajax = require('./Ajax');


var Song = {
  url() {
      if (sessionStorage.getItem('apiUrl')) {
          return sessionStorage.getItem('apiUrl') + '/api/songs';
      } else {
          return '/api/songs';
      }
  },

  all (active) {
      if (!active) {
        active = 'all';
      }
      return Ajax.post(this.url(), {active: active});
  },

  findById(songId) {
    return Ajax.get(this.url() + '/' + songId);
  },

  update(song) {
      return Ajax.put('/api/songs/' + song.id, {song: song});
  },

  add(song) {
      return Ajax.post('/api/songs/new', {song: song});
  },

  attachments(song_id) {
    return Ajax.get('/api/songs/' + song_id + '/attachments');
  },

  attachmentAdd(song_id, filename, fileData) {
    return Ajax.post('/api/songs/' + song_id + '/attachments', {filename: filename, data: fileData});
  },

  attachmentDelete(song_id, att_id) {
    return Ajax.delete('/api/songs/' + song_id + '/attachments/' + att_id);
  },

  chart(attachmentId) {
    return Ajax.get('/api/songs/chart/' + attachmentId);
  },

  transpose(attachmentId, chart, key) {
    return Ajax.post('/api/songs/chart/' + attachmentId + '/transpose', {key: key, chart: chart});
  },

  setlists(range) {
    return Ajax.get('/api/events/setlists', {range: range});
  },

  setlist(eventId, on_date) {
    return Ajax.get('/api/events/' + eventId + '/' + on_date + '/setlist');
  },

  setlistExists(eventId, on_date) {
    return Ajax.get('/api/events/' + eventId + '/' + on_date + '/setlist_exists');
  },

  upsertSetList(eventId, on_date, setlist) {
    return Ajax.post('/api/events/' + eventId + '/' + on_date + '/setlist', {setlist: setlist});
  },

  find(q) {
    return Ajax.post('/api/songs/find', {q: q});
  }
};

export default Song;

'use strict';
var Ajax = require('./Ajax');


var EventModel = {
    url: function() {
        if (sessionStorage.getItem('apiUrl')) {
            return sessionStorage.getItem('apiUrl') + '/api/events';
        } else {
            return '/api/events';
        }
    },

    all: function () {
        return Ajax.get(this.url());
    },

    findById: function(modelId) {
        return Ajax.get(this.url() + '/' + modelId);
    },

    date: function(modelId, onDate) {
        return Ajax.get(this.url() + '/' + modelId + '/date/' + onDate);
    },

    dates: function(modelId) {
        return Ajax.post(this.url() + '/' + modelId + '/event_dates', {});
    },

    roles: function(modelId) {
        return Ajax.get(this.url() + '/' + modelId + '/roles');
    },

    rota: function(modelId, fromDate) {
        return Ajax.get(this.url() + '/' + modelId + '/rota/' + fromDate );
    },

    // Upserts the rota
    upsertRota: function(eventId, onDate, rolePerson, focus, notes, url) {
        // Expecting dictionary: {role_id: person_id}
        // Iterate through the rolePerson object
        var rota = [];
        for (var key in rolePerson) {
            if (rolePerson.hasOwnProperty(key)) {
                var data = {
                    role_id: key,
                    person_id: rolePerson[key]
                }
                if ((key !== 'focus') && (key !== 'notes') && (key !== 'url')) {
                    rota.push(data);
                }
            }
        }

        var eventDate = {
            event_id: eventId, on_date: onDate, focus: focus, notes: notes, url: url, rota: rota
        };
        return Ajax.post(this.url() + '/' + eventId + '/upsert', eventDate);
    },

    addDate: function(eventId, eventDate) {
      return Ajax.post(this.url() + '/' + eventId + '/add_date', {on_date: eventDate});
    },

    deleteDate: function(eventId, eventDate) {
      return Ajax.delete(this.url() + '/' + eventId + '/' + eventDate);
    }
};

module.exports = EventModel;

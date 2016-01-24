'use strict';
var Ajax = require('./Ajax');


var Person = {
    url: function() {
        if (sessionStorage.getItem('apiUrl')) {
            return sessionStorage.getItem('apiUrl') + '/api/people';
        } else {
            return '/api/people';
        }
    },

    permissions: function() {
        return Ajax.post(this.url() + '/permissions');
    },

    all: function () {
        return Ajax.get(this.url());
    },

    update: function(person) {
        return Ajax.put('/rota/person/' + person.user_id, person);
    },

    findById: function(personId) {

        if (!personId) {
            // Get the current user's details
            //return $.get(this.url + '/me');
            return Ajax.get(this.url() + '/me');
        } else {
            return Ajax.get(this.url() + '/' + personId);
        }
    },

    rota: function(personId, range) {
        return Ajax.post(this.url() + '/' + personId + '/rota', {range: range});
    },

    // Away Dates
    awayDates: function(personId, range) {
        return Ajax.post(this.url() + '/' + personId + '/away_dates', {range: range});
    },

    upsertAwayDate: function(personId, away) {
      return Ajax.post(this.url() + '/' + personId + '/away_date', away);
    },

    deleteAwayDate: function(personId, away) {
      return Ajax.delete(this.url() + '/' + personId + '/away_date', away);
    }
};

module.exports = Person;

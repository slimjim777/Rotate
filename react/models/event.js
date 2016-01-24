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
    }
};

module.exports = EventModel;

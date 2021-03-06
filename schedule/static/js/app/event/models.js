// Models

App.Event = Ember.Object.extend({});

App.Event.reopenClass({
    url: '/api/events',

    findById: function(modelId) {
        return ajax(this.url + '/' + modelId, {
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    getAll: function() {
        return ajax(this.url, {
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    createDates: function(modelId, data) {
        return ajax('/api/events/' + modelId + '/event_dates/create', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    overview: function(modelId, data) {
        return ajax('/api/events/' + modelId + '/overview', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }

});

App.EventDate = Ember.Object.extend({});

App.EventDate.reopenClass({
    url: '/api/event_date/',

    getAll: function(modelId, range) {
        return ajax('/api/events/' + modelId + '/event_dates', {
            type: 'POST',
            data: JSON.stringify({range: range}),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    findById: function(modelId) {
        return ajax(this.url + modelId, {
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    updateRota: function(modelId, rota) {
        return ajax(this.url + modelId, {
            type: 'POST',
            data: JSON.stringify(rota),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    delete: function(modelId) {
        return ajax(this.url + modelId, {
            type: 'DELETE',
            data: JSON.stringify({eventId: modelId}),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }
});

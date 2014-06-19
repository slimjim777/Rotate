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
    }

});

App.EventDate = Ember.Object.extend({});

App.EventDate.reopenClass({
    url: '/api/events/',

    getAll: function(modelId, range) {
        return ajax(this.url + modelId + '/event_dates', {
            type: 'POST',
            data: JSON.stringify({range: range}),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    findById: function(modelId) {
        return ajax('/api/event_date/' + modelId, {
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

});

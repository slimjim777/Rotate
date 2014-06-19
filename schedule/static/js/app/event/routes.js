App.EventsRoute = Ember.Route.extend({
    model: function() {
        return App.Event.getAll().then(function(data) {
            return data.events;
        })
    }
});

App.EventRoute = Ember.Route.extend({
    model: function(params) {
        return App.Event.findById(params.event_id).then( function(data) {
            return App.Event.create(data.event);
        });
    },

    setupController: function(controller, model) {
        controller.set('content', model);

        // Trigger load of the event dates
        controller.set('datesRangeSelected', '8');
    }
});

App.EventDateRoute = Ember.Route.extend({
   model: function(params) {
        return App.EventDate.findById(params.event_date_id).then(function(data) {
            console.log(data.event_date);
            return App.EventDate.create(data.event_date);
        });
   }
});

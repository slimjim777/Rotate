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
        controller.set('datesRangeSelected', '12');
    },

    actions: {
        reloadModel: function() {
            this.refresh();
        }
    }
});

App.EventDateRoute = Ember.Route.extend({
    model: function(params) {
        console.log('EventDateRoute');
        return App.EventDate.findById(params.event_date_id).then(function(data) {
            return App.EventDate.create(data.event_date);
        });
    },

    actions: {
        reloadModel: function() {
            console.log('reloadModel');
            this.refresh();
        }
    },

    setupController: function(controller, model) {
        controller.set('content', model);

        // Reset the controller
        controller.set('eventDataLoading', false);
        controller.set('isEditing', false);
    }

});


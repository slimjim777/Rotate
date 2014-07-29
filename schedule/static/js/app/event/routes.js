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
        controller.getPermissions();

        // Trigger load of the event dates
        controller.datesRangeChange();
    },

    actions: {
        reloadModel: function() {
            this.refresh();
        }
    }
});

App.EventDateRoute = Ember.Route.extend({
    model: function(params) {
        return App.EventDate.findById(params.event_date_id).then(function(data) {
            return App.EventDate.create(data.event_date);
        });
    },

    actions: {
        reloadModel: function() {
            this.refresh();
        }
    },

    setupController: function(controller, model) {
        controller.set('content', model);
        controller.getPermissions();

        // Reset the controller
        controller.set('eventDataLoading', false);
        controller.set('isEditing', false);
    }

});

App.EventOverviewRoute = Ember.Route.extend({
    model: function(params) {;
        return App.Event.overview(params.event_id, {}).then(function(data) {
            return data.event_dates;
        });
    },

    setupController: function(controller, model) {
        controller.set('content', model);
        controller.getPermissions();

        if (!model.event_dates) {
            console.log('No Dates');
            this.refresh();
        }
    }
});

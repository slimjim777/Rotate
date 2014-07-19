App.EventController = Ember.ObjectController.extend({
    datesRangeSelected: '12',
    ranges: [{value: '12', name:'Upcoming'}, {value: '-12', name:'Recent'}],
    datesLoading: false,
    frequencies: [{value: 'weekly', name: 'Weekly'}, {value: 'monthly', name: 'Monthly'}, {value: 'irregular', name: 'Never'}],
    d_errors: null,

    getPermissions: function() {
        var controller = this;
        App.Person.permissions().then(function(result) {
            controller.set('permissions', result.permissions);
            controller.isEventAdmin(controller.get('model').id);
        });
    },

    isEventAdmin: function(eventId) {
        this.set('canAdministrate', false);
        if (this.get('permissions').is_admin) {
            this.set('canAdministrate', true);
            return;
        }

        this.get('permissions').events_admin.forEach(function(item) {
            if (item.id==eventId) {
                this.set('canAdministrate', true);
                return;
            }
        });
    },

    datesRangeChange: function() {
        var controller = this;
        controller.set('datesLoading', true);

        App.EventDate.getAll(this.get('model').id, this.get('datesRangeSelected')).then( function(data) {
            var event_dates = data.event_dates.map(function (ed) {
                return App.EventDate.create(ed);
            });
            controller.set('event_dates', event_dates);
            controller.set('datesLoading', false);
        }).catch(function(error) {
            console.log(error);
        });

    }.observes('datesRangeSelected'),

    actions: {
        createEventDates: function(event) {
            var postdata = {
                frequency: event.get('frequency'),
                repeats_every: 1, //event.get('repeat_every'),
                day_mon: event.get('day_mon'),
                day_tue: event.get('day_tue'),
                day_wed: event.get('day_wed'),
                day_thu: event.get('day_thu'),
                day_fri: event.get('day_fri'),
                day_sat: event.get('day_sat'),
                day_sun: event.get('day_sun'),
                from_date: event.get('from_date'),
                to_date: event.get('to_date')
            };

            var controller = this;

            App.Event.createDates(event.get('id'), postdata).then(function(result) {
                Ember.$('#dialog-form').modal('hide');
                controller.transitionToRoute('event', controller.get('model').get('id'));
            }).catch(function(error) {
                controller.set('d_error', error);
            });
        }
    }
});

App.EventDateController = Ember.ObjectController.extend({
    isEditing: false,
    eventDataLoading: false,

    eventDateForm: {},
    eventDateError: null,

    getPermissions: function() {
        var controller = this;
        App.Person.permissions().then(function(result) {
            controller.set('permissions', result.permissions);
            controller.isEventAdmin(controller.get('model').event_id);
        });
    },

    isEventAdmin: function(eventId) {
        this.set('canAdministrate', false);
        if (this.get('permissions').is_admin) {
            this.set('canAdministrate', true);
            return;
        }

        this.get('permissions').events_admin.forEach(function(item) {
            if (item.id==eventId) {
                this.set('canAdministrate', true);
                return;
            }
        });
    },

    actions: {
        editEventDate: function(event_date) {
            this.set('isEditing', true);
        },

        saveEventDate: function(event_date) {
            this.set('eventDataLoading', true);
            var update_rota = [];
            event_date.get('rota').forEach(function(r) {
                update_rota.addObject({
                    role_id: r.role.id,
                    person_id: r.person_id || 0
                });
            });

            var controller = this;

            var update = {
                focus: event_date.get('focus'),
                notes: event_date.get('notes'),
                rota: update_rota
            }

            App.EventDate.updateRota(this.get('model').get('id'), update).then(function(result) {
                controller.set('isEditing', false);
                controller.set('eventDataLoading', false);
                controller.send('reloadModel');   // Calls action on the route
            }).catch(function(error) {
                console.log(error);
            });
        },

        removeEventDate: function(ed) {
            console.log('removeEventDate');
            this.set('confirmHeader', 'Confirm Deletion');
            this.set('confirmBody', 'Delete event date?');
            this.set('eventDateForm', ed);

            Ember.$('#confirmModal').modal('show');
        },

        confirmYes: function() {
            var controller = this;

            // Delete the event date
            App.EventDate.delete(this.get('model').id).then(function(value) {
                controller.set('eventDateForm', {});
                Ember.$('#confirmModal').modal('hide');
                controller.transitionToRoute('event', controller.get('model').event_id);
            });
        },

        cancelEventDate: function(event_date) {
            this.set('isEditing', false);
        }
    }
});

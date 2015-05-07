App.EventsController = Ember.ObjectController.extend({
    menu: 'nav-events',

    reset: function() {
        setMenu(this);
    }
});


App.EventController = Ember.ObjectController.extend({
    menu: 'nav-events',
    datesRangeSelected: '12',
    ranges: [{value: '12', name:'Upcoming'}, {value: '-12', name:'Recent'}],
    datesLoading: false,
    frequencies: [{value: 'weekly', name: 'Weekly'}, {value: 'monthly', name: 'Monthly'}, {value: 'irregular', name: 'Never'}],
    d_errors: null,

    reset: function() {
        setMenu(this);
    },

    getPermissions: function() {
        var controller = this;
        App.Person.permissions().then(function(result) {
            controller.set('permissions', result.permissions);
            controller.isEventAdmin(controller.get('model').id);
        });
    },

    reset: function() {
        setMenu(this);
    },

    doesRepeat: function() {
        var frequency = this.get('model').frequency || this.get('model').get('frequency');
        if (!frequency) return true;
        if (frequency == 'irregular') {
            return false;
        } else {
            return true;
        }
    }.property('frequency'),

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
            controller.set('error', error.message);
        });

    }.observes('datesRangeSelected'),

    actions: {
        createEventDates: function(event) {
            var postdata = {
                frequency: event.frequency,
                repeats_every: 1, //event.get('repeat_every'),
                day_mon: event.day_mon,
                day_tue: event.day_tue,
                day_wed: event.day_wed,
                day_thu: event.day_thu,
                day_fri: event.day_fri,
                day_sat: event.day_sat,
                day_sun: event.day_sun,
                from_date: event.from_date,
                to_date: event.to_date
            };

            var controller = this;

            App.Event.createDates(event.id, postdata).then(function(result) {
                Ember.$('#dialog-form').modal('hide');
                controller.transitionToRoute('event', controller.get('model').id);
            }).catch(function(error) {
                controller.set('d_error', error);
            });
        }
    }
});

App.EventOverviewController = Ember.ObjectController.extend({
    from_date: moment().format('YYYY-MM-DD'),

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

    actions: {
        fromDateChange: function () {
            var controller = this;

            var postdata = {
                from_date: controller.get('from_date')
            };

            App.Event.overview(this.get('model').event_id, postdata).then(function (data) {
                var event_dates = data.event_dates.event_dates.map(function (ed) {
                    return App.EventDate.create(ed);
                });
                data.event_dates.event_dates = event_dates;

                var event = App.Event.create(data.event_dates);
                controller.set('model', event);
                controller.getPermissions();
            }).catch(function (error) {
                controller.set('error', error.message);
            });
        }.observes('from_date'),

        editEventDate: function(ed) {
            ed.set('isEditing', true);
        },

        cancelEventDate: function(ed) {
            ed.set('isEditing', false);
        },

        saveEventDate: function(ed) {
            var update_rota = [];
            ed.get('rota').forEach(function(r) {
                update_rota.addObject({
                    role_id: r.role.id,
                    person_id: r.person_id || 0
                });
            });

            var controller = this;
            var update = {
                focus: ed.get('focus'),
                notes: ed.get('notes'),
                rota: update_rota
            }

            App.EventDate.updateRota(ed.id, update).then(function(result) {
                ed.set('isEditing', false);
                var event_date = App.EventDate.create(result.event_date);

                var index = controller.get('model').event_dates.indexOf(ed);
                var dates = controller.get('model').event_dates;
                dates[index] = event_date;

                controller.get('model').event_dates.setObjects(dates);
            }).catch(function(error) {
                controller.set('error', error.message);
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

            App.EventDate.updateRota(this.get('model').id, update).then(function(result) {
                controller.set('isEditing', false);
                controller.set('eventDataLoading', false);
                controller.send('reloadModel');   // Calls action on the route
            }).catch(function(error) {
                controller.set('error', error.message);
            });
        },

        removeEventDate: function(ed) {
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

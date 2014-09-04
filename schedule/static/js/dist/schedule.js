App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

// Router

App.Router.map(function() {
    this.resource('index', { path: '/' });
    this.resource('person', { path: '/people/:id' });
    this.resource('person_create', { path: '/people/new' });
    this.resource('person_edit', { path: '/people/:id/edit' });
    this.resource('people', { path: '/people' });
    this.resource('people_page', {path: '/people/page/:page_no'})
    this.resource('events', { path: '/events/'});
    this.resource('event',  { path: '/events/:event_id'}, function() {
        this.resource('event_date',  { path: '/event_date/:event_date_id'});
    });
    this.resource('event_overview', { path: '/events/:event_id/overview'});

});
;App.EventsController = Ember.ObjectController.extend({
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
            console.log(event);
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

            App.Event.createDates(event.get('id'), postdata).then(function(result) {
                Ember.$('#dialog-form').modal('hide');
                controller.transitionToRoute('event', controller.get('model').get('id'));
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
                from_date: this.get('from_date')
            };

            App.Event.overview(this.get('model').event_id, postdata).then(function (data) {
                controller.set('model', data.event_dates);
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
;// Models

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
;App.EventsRoute = Ember.Route.extend({
    model: function() {
        return App.Event.getAll().then(function(data) {
            return data.events;
        })
    },

    setupController: function(controller, model) {
        controller.set('content', model);
        controller.reset();
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
        controller.reset();

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
    model: function(params) {
        return App.Event.overview(params.event_id, {}).then(function(data) {
            var event_dates = data.event_dates.event_dates.map(function (ed) {
                return App.EventDate.create(ed);
            });
            data.event_dates.event_dates = event_dates;

            var event = App.Event.create(data.event_dates);
            return event;
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
;
App.PersonController = Ember.ObjectController.extend({
    menu: 'nav-myrota',
    rotaRangeSelected: '12',
    ranges: [{value: '12', name:'Upcoming'}, {value: '-12', name:'Recent'}],
    rotaLoading: false,

    awayRangeSelected: '12',
    awayLoading: null,

    awayForm: {},
    awayError: null,

    reset: function() {
        setMenu(this);
    },

    getPermissions: function() {
        var controller = this;
        App.Person.permissions().then(function(result) {
            controller.set('permissions', result.permissions);
            controller.isPersonAdmin();
        });
    },

    isPersonAdmin: function() {
        this.set('canAdministratePerson', false);
        if (this.get('permissions').is_admin) {
            this.set('canAdministratePerson', true);
        } else if (this.get('model').id == this.get('permissions').user_id) {
            this.set('canAdministratePerson', true);
        }
    },

    rotaRangeChange: function() {
        var controller = this;
        controller.set('rotaLoading', true);

        App.Person.rota(this.get('model').id, this.get('rotaRangeSelected')).then( function(data) {
            controller.set('rota', data.rota);
            controller.set('rotaLoading', false);
        });

    }.observes('rotaRangeSelected'),

    awayRangeChange: function() {
        var controller = this;
        controller.set('awayLoading', true);

        App.Person.awayDates(this.get('model').id, this.get('awayRangeSelected')).then( function(data) {
            controller.set('away_dates', data.away_dates);
            controller.set('awayLoading', false);
        });

    }.observes('awayRangeSelected'),

    actions: {
        newAwayDates: function() {
            this.set('awayForm', {});
            this.set('awayError', null);
            Ember.$('#awayModal').modal('show');
        },
        
        saveAwayDate: function () {
            var controller = this;
            App.Person.upsertAwayDate(this.get('model').id, this.get('awayForm')).then(function(value) {
                // Update the away list
                var found = false;
                var away_dates = controller.get('away_dates').map(function(away) {
                    if (away.id === value.away_date.id) {
                        // Updated away date
                        found = true;
                        return value.away_date;
                    } else {
                        return away
                    }
                });

                if (!found) {
                    // New away date
                    away_dates.addObject(value.away_date);
                }

                controller.get('away_dates').setObjects(away_dates);
                Ember.$('#awayModal').modal('hide');
            }).catch(function(error) {
                controller.set('awayError', error.message);
            });
        },

        editAwayDate: function(away) {
            this.set('awayForm', {
                id: away.id,
                from_date: away.from_date,
                to_date: away.to_date
            });
            this.set('awayError', null);
            Ember.$('#awayModal').modal();
        },

        deleteAwayDate: function(away) {
            this.set('confirmHeader', 'Confirm Deletion');
            this.set('confirmBody', 'Delete away date?');
            this.set('awayForm', away);

            Ember.$('#confirmModal').modal('show');
        },

        confirmYes: function() {
            var controller = this;

            // Delete the away date
            App.Person.deleteAwayDate(this.get('model').id, this.get('awayForm')).then(function() {
                controller.get('away_dates').removeObject(controller.get('awayForm'));
                controller.set('awayForm', {});
                Ember.$('#confirmModal').modal('hide');
            });
        },

        refreshRota: function() {
            this.rotaRangeChange();
        },

        refreshAwayDates: function() {
            this.awayRangeChange();
        }
    }
});


App.PeoplePageController = Ember.ArrayController.extend({
    menu: 'nav-people',

    stateSelected: 'active',
    states: [{value: 'active', name:'Active Only'},
            {value: 'inactive', name:'Inactive Only'},
            {value: 'any', name:'Active & Inactive'}],

    getPermissions: function() {
        var controller = this;
        App.Person.permissions().then(function(result) {
            controller.set('permissions', result.permissions);
        });
    },

    reset: function() {
        setMenu(this);

        this.set('stateSelected', 'active');
        this.set('find_firstname', null);
        this.set('find_lastname', null);
    },

    actions: {
        findPeople: function() {
            var data = {
                firstname: this.get('find_firstname'),
                lastname: this.get('find_lastname'),
                active: this.get('stateSelected')
            };

            var controller = this;
            App.Person.find(data).then(function(result) {
                controller.get('content').setObjects(result.people);
                controller.set('meta', result.meta);
            }).catch(function(error) {
                controller.set('error', error.message);
            });
        },

        clearFind: function() {
            this.set('stateSelected', 'active');
            this.set('find_firstname', null);
            this.set('find_lastname', null);
            this.transitionToRoute('people');
        }
    }
});


App.PersonCreateController = Ember.ObjectController.extend({
    menu: 'nav-people',
    roles: [{value: 'standard', name:'Standard'}, {value: 'admin', name:'Admin'}],
    user_role: 'standard',
    firstname: null,
    lastname: null,
    email: null,
    guest: null,
    error: null,

    reset: function() {
        this.set('error', null);
        this.set('firstname', null);
        this.set('lastname', null);
        this.set('email', null);
        this.set('user_role', 'standard');
    },

    actions: {
        saveNewPerson: function () {
            var data = {
                firstname: this.get('firstname'),
                lastname: this.get('lastname'),
                email: this.get('email'),
                user_role: this.get('user_role'),
                guest: this.get('guest')
            };

            var controller = this;
            controller.set('error', null);

            App.Person.createNew(data).then(function(result) {
                controller.transitionToRoute('people');
            }).catch(function(error) {
                controller.set('error', error.message);
            });
        }
    }
});

App.PersonEditController = Ember.ObjectController.extend({
    menu: 'nav-people',
    roles: [{value: 'standard', name:'Standard'}, {value: 'admin', name:'Admin'}],

    actions: {
        savePerson: function(model) {
            var controller = this;
            controller.set('error', null);

            App.Person.edit(this.get('model').id, model).then(function(result) {
                controller.transitionToRoute('people');
            }).catch(function(error) {
                controller.set('error', error.message);
            });
        }
    }

});
;// Utilities

var DATE_FORMAT = 'DD/MM/YYYY';


// Ajax wrapper that returns a promise
function ajax (url, options) {
  return new Ember.RSVP.Promise(function (resolve, reject) {
    options = options || {};
    options.url = url;

    Ember.$.ajax(options).done(function (data) {
        if (data.response == 'Success') {
            resolve(data);
        } else {
            // Return error for validation errors
            reject(new Error(data.message));
        }
    }).fail(function (jqxhr, status, something) {
        reject(new Error("AJAX: `" + url + "` failed with status: [" + status + "] " + something));
    });
  });
}

Ember.Handlebars.registerBoundHelper('formatDate', function(date) {
    if (date) {
        return moment(date, 'YYYY-MM-DD').format(DATE_FORMAT);
    } else {
        return '';
    }
});

Ember.Handlebars.registerBoundHelper('shortDate', function(date) {
    if (date) {
        return moment(date, 'YYYY-MM-DD').format('DD MMM');
    } else {
        return '';
    }
});

Ember.Handlebars.registerBoundHelper('dateFromNow', function(date) {
    if (date) {
        return moment.utc(date, 'YYYY-MM-DDThh:mm:ss').fromNow();
    } else {
        return '';
    }
});

function setMenu(controller) {
    // Set the menu
    var menu = Ember.$('ul.navbar-nav li');

    $('ul.navbar-nav li').each(function() {
        var li = $(this);
        if (li.attr('id') == controller.get('menu')) {
            $(li).toggleClass('active', true);
        } else {
            $(li).toggleClass('active', false);
        }
    });
}

// Date picker widget for view
App.CalendarDatePicker = Ember.TextField.extend({
    _picker: null,

    modelChangedValue: function(){
        var picker = this.get("_picker");
        if (picker){
            picker.setDate(this.get("value"));
        }
    }.observes("value"),

    didInsertElement: function(){
        var currentYear = (new Date()).getFullYear();
        var formElement = this.$()[0];
        var picker = new Pikaday({
            field: formElement,
            yearRange: [1900,currentYear+2],
            format: 'YYYY-MM-DD'
        });
        this.set("_picker", picker);
    },

    willDestroyElement: function(){
        var picker = this.get("_picker");
        if (picker) {
            picker.destroy();
        }
        this.set("_picker", null);
    }
});


// Models

App.Person = Ember.Object.extend({});

App.Person.reopenClass({
    url: '/api/people',

    findById: function(modelId) {
        if ((!modelId) || (modelId === 'undefined')) {
            modelId = 'me';
        }
        return ajax(this.url + '/' + modelId, {
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    find: function(data) {
        return ajax(this.url + '/find', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    rota: function(modelId, range) {
        var data = {
            range: null
        };
        if (range) {
            data.range = range;
        }
        if ((!modelId)) {
            modelId = 'me';
        }

        return ajax(this.url + '/' + modelId + '/rota', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    awayDates: function(modelId, range) {
        var data = {
            range: null
        };
        if (range) {
            data.range = range;
        }
        if (!modelId) {
            modelId = 'me';
        }

        return ajax(this.url + '/' + modelId + '/away_dates', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    upsertAwayDate: function(modelId, away) {
        return ajax(this.url + '/' + modelId + '/away_date', {
            type: 'POST',
            data: JSON.stringify(away),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    deleteAwayDate: function(modelId, away) {
        return ajax(this.url + '/' + modelId + '/away_date', {
            type: 'DELETE',
            data: JSON.stringify(away),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },
    
    getAll: function (pageNo) {
        var url = this.url;
        if (pageNo) {
            url = this.url + '/page/' + pageNo;
        }
        return ajax(url, {
            type: 'GET',
            contentType: "application/json; charset=utf-8"
        });
    },

    createNew: function(data) {
        return ajax(this.url + '/new', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    edit: function(modelId, data) {
        return ajax(this.url + '/' + modelId, {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    permissions: function() {
        return ajax('/api/permissions', {
            type: 'POST',
            data: JSON.stringify({}),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }

});

;App.IndexRoute = Ember.Route.extend({
  beforeModel: function() {
    this.transitionTo('person', 'me');
  }
});

App.PersonRoute = Ember.Route.extend({
    model: function(params) {
        if (params.id === 'undefined') {
            this.transitionTo('person', 'me');
        }
        return App.Person.findById(params.id).then( function(data) {
            return data.person;
        });
    },

    setupController: function(controller, model) {
        controller.set('content', model);
        controller.getPermissions();
        controller.reset();

        // Trigger load of the person's rota
        controller.rotaRangeChange();
        controller.awayRangeChange();
    }

});

App.PeopleRoute = Ember.Route.extend({
    beforeModel: function() {
        this.transitionTo('people_page', 1);
    }
});

App.PeoplePageRoute = Ember.Route.extend({
    model: function(params) {
        console.log('PeoplePageRoute');
        var pageNo = null;
        if (params.page_no) {
            pageNo = params.page_no;
        }
        return App.Person.getAll(pageNo).then(function(data) {
            // This is a paginated result
            return data;
        })
    },

    setupController: function(controller, model) {
        controller.getPermissions();
        // Extract the rows and the pagination metadata
        controller.set('content', model.people);
        controller.set('meta', model.meta);
        controller.reset();
    }
});

App.PersonCreateRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        controller.reset();
    }
});

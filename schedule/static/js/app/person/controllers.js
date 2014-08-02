
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
                user_role: this.get('user_role')
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

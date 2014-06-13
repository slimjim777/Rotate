
App.PersonController = Ember.ObjectController.extend({
    menu: 'nav-myrota',
    rotaRangeSelected: null,
    ranges: [{value: '8', name:'Upcoming'}, {value: '-12', name:'Recent'}],
    rotaLoading: false,

    awayRangeSelected: null,
    awayLoading: null,

    awayForm: {},
    awayError: null,

    rotaRangeChange: function() {
        var controller = this;
        controller.set('rotaLoading', true);

        App.Person.rota(this.get('person').get('id'), this.get('rotaRangeSelected')).then( function(data) {
            controller.set('rota', data.rota);
            controller.set('rotaLoading', false);
        });

    }.observes('rotaRangeSelected'),

    awayRangeChange: function() {
        var controller = this;
        controller.set('awayLoading', true);

        App.Person.awayDates(this.get('person').get('id'), this.get('awayRangeSelected')).then( function(data) {
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
            App.Person.upsertAwayDate(this.get('person').get('id'), this.get('awayForm')).then(function(value) {
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
            App.Person.deleteAwayDate(this.get('person').get('id'), this.get('awayForm')).then(function(value) {
                controller.get('away_dates').removeObject(controller.get('awayForm'));
                controller.set('awayForm', {});
                Ember.$('#confirmModal').modal('hide');
            });
        }
    }
});


App.PeopleController = Ember.ArrayController.extend({
    menu: 'nav-people',

    actions: {}

});


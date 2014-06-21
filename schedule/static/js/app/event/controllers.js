App.EventController = Ember.ObjectController.extend({
    datesRangeSelected: null,
    ranges: [{value: '8', name:'Upcoming'}, {value: '-12', name:'Recent'}],
    datesLoading: false,

    datesRangeChange: function() {
        var controller = this;
        controller.set('datesLoading', true);

        App.EventDate.getAll(this.get('model').id, this.get('datesRangeSelected')).then( function(data) {
            console.log(data.event_dates);
            var event_dates = data.event_dates.map(function (ed) {
                return App.EventDate.create(ed);
            });
            controller.set('event_dates', event_dates);
            controller.set('datesLoading', false);
        }).catch(function(error) {
            console.log(error);
        });

    }.observes('datesRangeSelected')
});

App.EventDateController = Ember.ObjectController.extend({
    isEditing: false,
    dataLoading: false,

    actions: {
        editEventDate: function(event_date) {
            console.log('editEventDate');
            this.set('isEditing', true);
        },

        saveEventDate: function(event_date) {
            console.log('saveEventDate');
            var update_rota = [];
            event_date.get('rota').forEach(function(r) {
                update_rota.addObject({
                    role_id: r.role.id,
                    person_id: r.person_id || 0
                });
            });
            console.log(update_rota);
            console.log(this.get('model'));
            console.log(event_date);

            var controller = this;
            App.EventDate.updateRota(this.get('model').get('id'), update_rota).then(function(result) {
                console.log(result);
                //controller.get('model').set('rota', event_date.get('rota'));
                //controller.transitionToRoute('event_date', event_date.get('id'));
                controller.set('isEditing', false);
                controller.set('dataLoading', true);
                controller.send('reloadModel');   // Calls action on the route
            }).catch(function(error) {
                console.log(error);
            });
        },

        cancelEventDate: function(event_date) {
            console.log('cancelEventDate');
            this.set('isEditing', false);
        }
    }
});

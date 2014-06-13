
App.PersonRoute = Ember.Route.extend({
    model: function(params) {
        console.log('PersonRoute');
        console.log(params);
        return Ember.RSVP.hash({
            person: App.Person.findById(params.id).then( function(data) {
                return App.Person.create(data.person);
            })
        });
    },

    setupController: function(controller, model) {
        controller.set('content', model);

        // Trigger load of the person's rota
        controller.set('rotaRangeSelected', '8');
    },

    beforeModel: function(transition, b, c) {
        // Redirect to /me when no person_id supplied
        if (!transition.params.person.id) {
            this.transitionTo('person', 'me');
        }
    }
});


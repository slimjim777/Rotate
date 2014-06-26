App.IndexRoute = Ember.Route.extend({
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

        // Trigger load of the person's rota
        controller.set('rotaRangeSelected', '12');
    }

});

App.PeopleRoute = Ember.Route.extend({
    model: function() {
        return App.Person.getAll().then(function(data) {
            return data.people;
        })
    }
});

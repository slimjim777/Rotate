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
        controller.getPermissions();

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
    }
});

App.PersonCreateRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        controller.reset();
    }
});

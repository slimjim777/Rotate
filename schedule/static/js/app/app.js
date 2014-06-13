App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

// Router

App.Router.map(function() {
    this.resource('person', { path: '/' });
    this.resource('person', { path: '/people/:id' });
    this.resource('people', { path: '/people' });
});
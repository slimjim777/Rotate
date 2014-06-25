App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

// Router

App.Router.map(function() {
    this.resource('person', { path: '/' });
    this.resource('person', { path: '/people/:id' });
    this.resource('people', { path: '/people' });
    this.resource('events', { path: '/events'});
    this.resource('event',  { path: '/event/:event_id'}, function() {
        this.resource('event_date',  { path: '/event_date/:event_date_id'});
    });
});

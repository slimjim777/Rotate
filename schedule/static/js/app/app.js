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

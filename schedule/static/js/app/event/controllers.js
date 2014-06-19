
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

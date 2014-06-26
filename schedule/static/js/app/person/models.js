// Utilities

var DATE_FORMAT = 'DD/MM/YYYY';


// Ajax wrapper that returns a promise
function ajax (url, options) {
  return new Ember.RSVP.Promise(function (resolve, reject) {
    options = options || {};
    options.url = url;

    Ember.$.ajax(options).done(function (data) {
        if (data.response == 'Success') {
            resolve(data);
        } else {
            // Return error for validation errors
            reject(new Error(data.message));
        }
    }).fail(function (jqxhr, status, something) {
        reject(new Error("AJAX: `" + url + "` failed with status: [" + status + "] " + something));
    });
  });
}

Ember.Handlebars.registerBoundHelper('formatDate', function(date) {
    if (date) {
        return moment(date, 'YYYY-MM-DD').format(DATE_FORMAT);
    } else {
        return '';
    }
});

Ember.Handlebars.registerBoundHelper('dateFromNow', function(date) {
    if (date) {
        return moment.utc(date, 'YYYY-MM-DDThh:mm:ss').fromNow();
    } else {
        return '';
    }
});

// Date picker widget for view
App.CalendarDatePicker = Ember.TextField.extend({
    _picker: null,

    modelChangedValue: function(){
        var picker = this.get("_picker");
        if (picker){
            picker.setDate(this.get("value"));
        }
    }.observes("value"),

    didInsertElement: function(){
        var currentYear = (new Date()).getFullYear();
        var formElement = this.$()[0];
        var picker = new Pikaday({
            field: formElement,
            yearRange: [1900,currentYear+2],
            format: 'YYYY-MM-DD'
        });
        this.set("_picker", picker);
    },

    willDestroyElement: function(){
        var picker = this.get("_picker");
        if (picker) {
            picker.destroy();
        }
        this.set("_picker", null);
    }
});


// Models

App.Person = Ember.Object.extend({});

App.Person.reopenClass({
    url: '/api/people',

    findById: function(modelId) {
        if ((!modelId) || (modelId === 'undefined')) {
            modelId = 'me';
        }
        return ajax(this.url + '/' + modelId, {
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    rota: function(modelId, range) {
        var data = {
            range: null
        };
        if (range) {
            data.range = range;
        }
        if ((!modelId)) {
            modelId = 'me';
        }

        return ajax(this.url + '/' + modelId + '/rota', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    awayDates: function(modelId, range) {
        var data = {
            range: null
        };
        if (range) {
            data.range = range;
        }
        if (!modelId) {
            modelId = 'me';
        }

        return ajax(this.url + '/' + modelId + '/away_dates', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    upsertAwayDate: function(modelId, away) {
        return ajax(this.url + '/' + modelId + '/away_date', {
            type: 'POST',
            data: JSON.stringify(away),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },

    deleteAwayDate: function(modelId, away) {
        return ajax(this.url + '/' + modelId + '/away_date', {
            type: 'DELETE',
            data: JSON.stringify(away),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    },
    
    getAll: function () {
        return ajax(this.url, {
            type: 'GET',
            contentType: "application/json; charset=utf-8"
        });
    }

});


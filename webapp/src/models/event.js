'use strict';
var Ajax = require('./Ajax');


var EventModel = {
    url() {
        if (sessionStorage.getItem('apiUrl')) {
            return sessionStorage.getItem('apiUrl') + '/api/events';
        } else {
            return '/api/events';
        }
    },

    all () {
        return Ajax.get(this.url());
    },

    findById(modelId) {
        return Ajax.get(this.url() + '/' + modelId);
    },

    date(modelId, onDate) {
        return Ajax.get(this.url() + '/' + modelId + '/date/' + onDate);
    },

    dates(modelId) {
        return Ajax.post(this.url() + '/' + modelId + '/event_dates', {});
    },

    roles(modelId) {
        return Ajax.get(this.url() + '/' + modelId + '/roles');
    },

    rota(modelId, fromDate) {
        return Ajax.get(this.url() + '/' + modelId + '/rota/' + fromDate );
    },

    // Upserts the rota
    upsertRota(eventId, onDate, rolePerson, focus, notes, url) {
        // Expecting dictionary: {role_id: person_id}
        // Iterate through the rolePerson object
        var rota = [];
        for (var key in rolePerson) {
            if (rolePerson.hasOwnProperty(key)) {
                var data = {
                    role_id: key,
                    person_id: rolePerson[key]
                }
                if ((key !== 'focus') && (key !== 'notes') && (key !== 'url')) {
                    rota.push(data);
                }
            }
        }

        var eventDate = {
            event_id: eventId, on_date: onDate, focus: focus, notes: notes, url: url, rota: rota
        };
        return Ajax.post(this.url() + '/' + eventId + '/upsert', eventDate);
    },

    runsheet(eventId, onDate) {
        return Ajax.get(this.url() + '/' + eventId + '/' + onDate + '/runsheet');
    },

    runsheets(range) {
        return Ajax.get(this.url() + '/runsheets', {range: range});
    },

    runsheetEvents(event_id) {
        return Ajax.get(this.url() + '/' + event_id + '/runsheets');
    },

    runsheetParentEvents() {
        return Ajax.get(this.url() + '/parent_events');
    },

    runsheetTemplates(range) {
        return Ajax.get(this.url() + '/runsheet_templates');
    },

    runsheetTemplateCreate(name, event_id) {
        return Ajax.post(this.url() + '/runsheet_templates', {name: name, event_id: event_id});
    },

    runsheetTemplate(templateId) {
        return Ajax.get(this.url() + '/runsheet_templates/' + templateId);
    },

    runsheetTemplateUpdate(templateId, template) {
        return Ajax.put(this.url() + '/runsheet_templates/' + templateId, {template: template});
    },

    runsheetTemplatesForEvent(eventId) {
        return Ajax.get(this.url() + '/' + eventId + '/runsheet_templates');
    },

    updateRunsheet(eventId, on_date, runsheet) {
      return Ajax.post(this.url() + '/' + eventId + '/' + on_date + '/runsheet', {runsheet: runsheet});
    },

    updateRunsheetNotes(eventId, on_date, notes) {
      return Ajax.post(this.url() + '/' + eventId + '/' + on_date + '/runsheet_notes', {runsheet_notes: notes});
    },

    addDate(eventId, eventDate) {
      return Ajax.post(this.url() + '/' + eventId + '/add_date', {on_date: eventDate});
    },

    deleteDate(eventId, eventDate) {
      return Ajax.delete(this.url() + '/' + eventId + '/' + eventDate);
    }


};

export default EventModel;

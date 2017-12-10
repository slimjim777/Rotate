import Ajax from './Ajax';


var Person = {
    url() {
        if (sessionStorage.getItem('apiUrl')) {
            return sessionStorage.getItem('apiUrl') + '/api/people';
        } else {
            return '/api/people';
        }
    },
    
    login(email, password) {
        return Ajax.post('/api/login', {email: email, password: password});
    },

    permissions() {
        return Ajax.post(this.url() + '/permissions');
    },

    all () {
        return Ajax.get(this.url());
    },

    create(person) {
        return Ajax.post('/api/people/new', person);
    },

    update(person) {
        return Ajax.put('/api/people/' + person.id, person);
    },

    findById(personId) {

        if (!personId) {
            // Get the current user's details
            //return $.get(this.url + '/me');
            return Ajax.get(this.url() + '/me');
        } else {
            return Ajax.get(this.url() + '/' + personId);
        }
    },

    rota(personId, range) {
        return Ajax.post(this.url() + '/' + personId + '/rota', {range: range});
    },

    // Away Dates
    awayDates(personId, range) {
        return Ajax.post(this.url() + '/' + personId + '/away_dates', {range: range});
    },

    upsertAwayDate(personId, away) {
      return Ajax.post(this.url() + '/' + personId + '/away_date', away);
    },

    deleteAwayDate(personId, away) {
      return Ajax.delete(this.url() + '/' + personId + '/away_date', away);
    }
};

export default Person;

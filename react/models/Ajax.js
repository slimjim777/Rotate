'use strict';
var request =require('then-request');


// Wrapper for API calls to add the authorization header
var Ajax = {
    get: function(url) {
        return request('GET', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')}
        });
    },

    post: function(url, data) {
        return request('POST', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            json: data
        });
    },

    put: function(url, data) {
        return request('PUT', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            json: data
        });
    },

    delete: function(url, data) {
        return request('DELETE', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            json: data
        });
    }
};

module.exports = Ajax;

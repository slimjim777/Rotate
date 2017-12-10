import request from 'then-request';


// Wrapper for API calls to add the authorization header
var Ajax = {
    get(url, data) {
        return request('GET', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            qs: data
        });
    },

    post(url, data) {
        return request('POST', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            json: data
        });
    },

    put(url, data) {
        return request('PUT', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            json: data
        });
    },

    delete(url, data) {
        return request('DELETE', url, {
            headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
            json: data
        });
    }
};

export default Ajax;

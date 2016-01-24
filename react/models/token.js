'use strict';
var $ = require('jquery');


var Token = {
    get: function() {
        return $.get('/rota/token');
    }
};

module.exports = Token;
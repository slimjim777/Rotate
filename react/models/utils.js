'use strict'
var React = require('react');
var moment = require('moment');

const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
const SQL_FORMAT = 'YYYY-MM-DDThh:mm:ss';

const ROLE_SETLIST = 'set-list'
const ROLE_STANDARD = 'standard'
const ROLE_ADMIN = 'admin'


var Utils = {

  relativeDate: function(datetime) {
    var m = moment.utc(datetime, moment.ISO_8601);
    return m.format(DATETIME_FORMAT);
  },

  arraySwap: function(arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
  },

  renderMultiLine: function(notes) {
    if (notes) {
      var i = 0;
      return notes.split('\n').map(function(item) {
        i += 1;
        return (
          <span key={i}>{item}<br /></span>
        );
      });
    }
  }

}


module.exports = Utils;

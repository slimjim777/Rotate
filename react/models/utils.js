var moment = require('moment');

const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
const SQL_FORMAT = 'YYYY-MM-DDThh:mm:ss';

var Utils = {

  relativeDate: function(datetime) {
    console.log(datetime);
    var m = moment.utc(datetime, moment.ISO_8601);
    console.log(m);
    return m.format(DATETIME_FORMAT);
  }

}

module.exports = Utils;

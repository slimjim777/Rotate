'use strict';
var $ = require('jquery');


var Utils = {
    arraySwap: function(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    }
};

module.exports = Utils;

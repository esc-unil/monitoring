'use strict';
/**
 * Created by tpineau
 *
 */
var whois = require('node-whois');


whois.lookup('anabolics.com', function(err, data) {
    console.log(data)
});
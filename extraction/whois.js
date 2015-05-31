'use strict';
/**
 * Created by tpineau
 *
 */
var whois = require('node-whois');


whois.lookup('seelit.com', function(err, data) {
    console.log(data)
});
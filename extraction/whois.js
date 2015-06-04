'use strict';
/**
 * Created by tpineau
 *
 */
var whois = require('node-whois');


whois.lookup('74.206.160.137', function(err, data) {
    if (err){callback(err);}

    console.log(data)
});

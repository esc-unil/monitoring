'use strict';
/**
 * Created by tpineau
 *
 */
var whois = require('node-whois');


whois.lookup('www.bookdepository.com', function(err, data) {
    if (err){callback(err);}

    console.log(data)
});
'use strict';
/**
 * Created by tpineau
 *
 */

var request = require('request');
var http = require('http');

function header(url, callback){
    var options = {
        method: "HEAD",
        url: url,
        followAllRedirects: true,
        timeout: 50000,
        rejectUnauthorized: false,
        requestCert: true,
        pool:  new http.Agent({'maxSockets': Infinity})
    };
    request(options, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.headers);
        }
    }).setMaxListeners(0);
}

header('https://www.buysteroidonline.com/', function (a,b) {console.log(b);});
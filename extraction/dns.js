'use strict';
/**
 * Created by tpineau
 *
 * NS: DNS
 * SOA: serveur autoritaire
 * MX: serveurs de messageries
 * A: ipv4
 * AAAA: ipv6
 *
 *
 */

var dns = require('dns');

function ip(hostname, callback) {
    dns.lookup(hostname, function onLookup(err, res) {
        if (err) {callback(err, null)}
        else {callback(null, res);}
    });
}


function reverse(hostname, callback){ //resolve6 existe all ip?
    dns.resolve4(hostname, function (err, addresses) {
        if (err) {callback(err);}
        else {

            console.log('addresses: ' + JSON.stringify(addresses));

            addresses.forEach(function (a) {
                dns.reverse(a, function (err, hostnames) { // ip -> nom de domaine
                    if (err) {callback(err);}
                    else {
                        console.log('reverse for ' + a + ': ' + JSON.stringify(hostnames));
                    }
                 });
            });
         }
    });
    dns.resolve(hostname, 'MX', function (err, addresses) {
        if (err) {callback(err);}
        else {

            console.log('addresses: ' + JSON.stringify(addresses));



        }
    });
}

function ns(hostname, callback){
    dns.resolve(hostname, 'NS', function (err, res) {
        if (err) {callback(err);}
        else {callback(null, res);}
    });
}

//ip('www.steroid.com', function(a,b){console.log(b);});

ns('unil.ch', function(a,b){console.log(b);});
reverse('unil.ch', function(a,b){console.log(b);});

//dns.lookup('mx.unil.ch', function(a,b){console.log(b);});




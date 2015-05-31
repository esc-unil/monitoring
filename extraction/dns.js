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
var async = require('async');

function ip(hostname, callback) {
    dns.lookup(hostname, function onLookup(err, res) {
        if (err) {callback(err, null)}
        else {callback(null, res);}
    });
}

function ns(hostname, callback){
    dns.resolve(hostname, 'NS', callback);
}

function mx(hostname, callback){
    dns.resolve(hostname, 'MX', callback);
}

function ipv4(hostname, callback){
    dns.resolve(hostname, 'A', callback);
}

function ipv6(hostname, callback){
    dns.resolve(hostname, 'AAAA', callback);
}


function reverse(hostname, callback){
    async.concatSeries(
        ['resolve4', 'resolve6'],  //reverse ipv4 et ipv6
        function(resolve, cb){
            dns[resolve](hostname, function (err, addresses) {
                if (err) {cb();}
                else {
                    async.concatSeries(
                        addresses,
                        function(ip, cbip){
                            dns.reverse(ip, function (err, hostnames) { // ip -> nom de domaine
                                if (err) {var hostnames= undefined;}
                                cbip(null, {hostname: hostname, ip: ip, reverse: hostnames});
                            });
                        },
                        function(err, res){
                            cb(null, res);
                        }
                    );
                }
            })
        },
        function (err, res){
            if (err) {callback(err);}
            else {callback(err, res);}
        }
    );
}



mx('anabolics.com', function(a,b){console.log(b);});
mx('buysteroids.com', function(a,b){console.log(b);});

//reverse('anabolics.com', function(error, domains) {console.log(domains); });
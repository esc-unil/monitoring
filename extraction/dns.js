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
        if (err) {callback(err)}
        else {callback(null, res);}
    });
}

function ips(hostname, callback) { //recherche IP (v4 et v6)
    dns.resolve(hostname, 'A', function(err, ipv4){
        var ips = [];
        if (!err || ipv4 != null || ipv4 != undefined) {ips = ipv4;}
        dns.resolve(hostname, 'AAAA', function(err, ipv6){
            if (!err || ipv6 != null || ipv6 != undefined) {ips = ips.concat(ipv6)}
            if (ips === []) {callback(err);}
            else {callback(null, ips);}
        });
    });
}

function ns(hostname, callback){
    dns.resolve(hostname, 'NS', function(err, res){
        if (err) {callback(err);}
        else {
            async.concat(
                res,
                function (item, cb) {
                    ips(item, function (err, res) {
                        if (err) {cb(null, {dns: item, ip: null});}
                        else {cb(null, {dns: item, ip: res});}
                    });
                },
                function (err, dns) {
                    if (err) {callback(err);}
                    else {callback(null, dns);}
                }
            );
        }
    });
}

function mx(hostname, callback){
    dns.resolve(hostname, 'MX', function(err, res){
        if (err){callback(err);}
        else {
            async.concat(
                res,
                function (item, cb) {
                    ips(item.exchange, function (err, res) {
                        if (err) {cb(null, {exchange: item.exchange, priority: item.priority, ip: null});}
                        else {cb(null, {exchange: item.exchange, priority: item.priority, ip: res});}
                    });
                },
                function (err, dns) {
                    if (err) {callback(err);}
                    else {callback(null, dns);}
                }
            );
        }
    });
}

function soa(hostname, callback){
    dns.resolve(hostname, 'SOA', function(err, soa){
        if (err){callback(err);}
        else {
            ips(soa.nsname, function (err, res) {
                var obj = soa;
                if (err) {obj.ip = null;}
                else {obj.ip = res;}
                callback(null, obj);
            });
        }
    });
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

exports.ips = ips;
exports.ns = ns;
exports.mx = mx;
exports.soa = soa;

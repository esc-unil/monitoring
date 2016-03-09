'use strict';
/**
 * Created by tpineau
 *
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var dns = require('../extraction/dns');
var request = require('../extraction/request');
var whois = require('node-whois');



function run(database, fromCollection, toCollection, category){
    var mongoPath = 'mongodb://localhost:27017/' + database;
    mongoClient.connect(mongoPath, function (err, db) {
        if (err){console.log(err);}
        else db.collection(fromCollection).find({category: category}).toArray(function (err, res) {
                async.eachSeries(
                    res,
                    function (item, cb) {
                        var obj = {
                            hostname: item._id,
                            domain: item.domain
                        };
                        dns.ips(obj.hostname, function (err, resp) {
                            if (!err && resp[0] != undefined) {
                                obj.ip = resp;
                            }
                            dns.mx(obj.hostname, function (err, resp) {
                                if (!err) {
                                    obj.mx = resp;
                                }
                                dns.ns(obj.hostname, function (err, resp) {
                                    if (!err) {
                                        obj.ns = resp;
                                    }
                                    request.headersNbody(obj.hostname, function (err, headers, body) {
                                        if (!err) {
                                            obj.headers = headers;
                                            obj.body = body;
                                        }
                                        obj.date = new Date();
                                        db.collection(toCollection).insert(obj, function (err) {
                                            console.log(obj.hostname);
                                            cb();
                                        });
                                    });
                                });
                            });
                        });
                    },
            function (err) {
                console.log('done :)');
                db.close();
            }
        );
     });
    });
}

function analytics(text){
    var re = /UA-[0-9]+/i;
    var match = text.match(re);
    if (match != null && typeof match != 'undefined'){
        return match[0];
    } else {
        return null;
    }
}

run('doping', 'hostnames2', 'data', "1");
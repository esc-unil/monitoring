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
        else {
            db.collection(fromCollection).find({category:category}).limit(10).toArray(function (err, res) {
                async.eachSeries(
                    res,
                    function(item, cb){
                        var obj = {
                            hostname: item._id,
                            domain : item.domain
                        };
                        var name='';
                        async.eachSeries(
                            [dns.ips, dns.mx, dns.ns, request.headers, request.body],//, request.sslCertificate],
                            function (f, cbf){
                                if (f==dns.ips){name='ip';}
                                else if (f==dns.mx){name='mx';}
                                else if (f==dns.ns){name='ns';}
                                else if (f==request.headers){name='headers';}
                                else if (f==request.body){name='body';}
                                else if (f==request.sslCertificate){name='sslCertificate';}
                                f(obj.hostname, function (err, res){
                                    if (err || res==null) {cbf();}
                                    obj[name] = res;
                                    //db.collection(toCollection).insert(i, function(err){cbf();});
                                    cbf();
                                });
                            },
                            function (err){
                                if (err){console.log(err);}
                                obj.date = new Date;
                                db.collection(toCollection).insert(obj, function(err){cb();});
                                //console.log(obj); cb();
                            }
                        );
                    },
                    function(err){
                        console.log('done1');
                        db.close();
                    }
                );


            });
        }
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
'use strict';
/**
 * Created by tpineau
 *
 * les 'count' correspondent au nombre d'urls dans la DB en lien avec le hostname
 * (!!! peu compter plusieurs fois chaque url si detecte avec des mots-clefs differents !!!)
 */

var async = require('async');
var nwhois = require('node-whois').lookup;
var mongoClient = require('mongodb').MongoClient;
var screenshot = require('../extraction/screenshot').screenshot;
var headersNbody = require('../extraction/request').headersNbody;
var dns = require('../extraction/dns');

var monitoring = require('../monitoring.json');

function run(database, urlsCol, hostnamesCol, target){
    //lance le processus de recherche d'hostnames dans la collection urlsCOl et les integre dans hostnamesCol
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {
            db.collection(urlsCol).distinct('hostname', target, function(err, hostnames){
                if (err){console.log(err); db.close();}
                else {
                    async.eachLimit(
                        hostnames,
                        10,
                        function(hostname, cb){
                            db.collection(hostnamesCol).count({hostname: hostname}, function (err, n) {
                                if (err || n!=0){cb();}
                                else if (n === 0){
                                    integrate(db, hostname, urlsCol, hostnamesCol, cb);
                                }
                            });
                        },
                        function(err){
                            if (err) {console.log(err);}
                            else {console.log('done');}
                            db.close();
                        }
                    );
                }
            });

        }
    });
}

function integrate(db, hostname, urlsCol, hostnamesCol, callback){
    var date = new Date();
    var obj = {
        _id: hostname,
        date: date,
        category: null
    };
    async.eachSeries(
        [screen, request, ip, ns, mx, soa],
        function(fct, cb){
            fct(hostname, obj, cb);
        },
        function(err){
            if (err){console.log(err); callback(err);}
            else {
                db.collection(hostnamesCol).insert(obj, function (err) {
                    if (err) {callback(err);}
                    else {
                        db.collection(urlsCol).update({hostname: hostname, integrate: 0}, {$set: {integrate: 1}}, function (err) {
                            if (err) console.log(obj._id, err);
                            callback(null);
                        });
                    }
                });
            }
        }
    );
}

function screen(hostname, obj, callback){
    var screenHostname = hostname + '.jpg';
    var screen = monitoring.screenshotFolder +  '/' + screenHostname;
    screenshot(hostname, screen, function(err) {
        if (err) {obj.screenshot = null;}
        else {obj.screenshot = screenHostname;}
        callback();
    });
}

function request(hostname, obj, callback){
    headersNbody(hostname, function (err, headers, body){
        obj.headers = headers;
        obj.body = body;
        callback();
    });
}

function ip(hostname, obj, callback){
    dns.ips(hostname, function (err, ips){
        if (err || ips === [] || ips === undefined){obj.ip = null;}
        else {obj.ip = ips;}
        callback();
    });
}

function ns(hostname, obj, callback){
    dns.ns(hostname, function (err, ns){
        if (err || ns === [] || ns === undefined){obj.ns = null;}
        else {obj.ns = ns;}
        callback();
    });
}

function mx(hostname, obj, callback){
    dns.mx(hostname, function (err, mx){
        if (err || mx === [] || mx === undefined){obj.mx = null;}
        else {obj.mx = mx;}
        callback();
    });
}

function soa(hostname, obj, callback){
    dns.soa(hostname, function (err, soa){
        if (err || soa === [] || soa === undefined){obj.soa = null;}
        else {obj.soa = soa;}
        callback();
    });
}

/*function whois(hostname, obj, callback){
    nwhois(hostname, function(err, data){
        if (err){obj.whois = null;}
        else {obj.whois = data;}
        callback();
    });
}*/


run(monitoring.DBrecherche, 'urls', 'hostnames', {integrate:0});
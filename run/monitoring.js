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

function run(database, col, target){
    //lance le processus de recherche d'hostnames dans la collection urlsCOl et les integre dans hostnamesCol
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {
            db.collection(col).find(target, {_id:1}).toArray(function(err, hostnames){
                var c =1;
                var all = hostnames.length;
                if (err){console.log(err); db.close();}
                else {
                    async.eachLimit(
                        hostnames,
                        20,
                        function(item, cb){
                            getData(db, item._id, function(err){
                                console.log(c.toString() + '/' + all.toString());
                                c = c+1;
                                cb();
                            });
                        },
                        function(err){
                            console.log('done');
                            db.close()
                        }
                    );
                }
            });
        }
    });
}

function getData(db, hostname, callback){
    var date = new Date();
    var obj = {
        _id: hostname,
        date: date
    };
    async.eachSeries(
        [request, ip, ns, mx, soa],
        function(fct, cb){
            fct(hostname, obj, cb);
        },
        function(err){
            if (err){console.log(err); callback(err);}
            else {
                db.collection('data').insert(obj, function (err) {
                    console.log(hostname);
                    if (err) {callback(err);}
                    else {callback(null);}
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


run(monitoring.DBrecherche, 'hostnames', {category:null});
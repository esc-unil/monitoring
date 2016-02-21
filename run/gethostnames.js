'use strict';
/**
 * Created by tpineau
 *
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var screenshot = require('../extraction/screenshot').screenshot;
var headersNbody = require('../extraction/request').headersNbody;

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
            db.collection(urlsCol).aggregate({$match: target},{$group:{_id:'$hostname', date:{$min:'$date'}}},  function(err, hostnames){
                if (err){console.log(err); db.close();}
                else {
                   async.eachLimit(
                        hostnames,
                       20,
                        function(hostname, cb){
                            var re = /([^\.\s]+\.[^\.\s]+)$/i; // hostname relative
                            var domain = hostname._id.match(re);
                            if (domain != null) {
                                hostname.domain = domain[0];
                                db.collection(hostnamesCol).count({_id: hostname._id}, function (err, res){
                                    if (err || res != 0) {
                                        if (err) {console.log(err);}
                                        cb()
                                    }
                                    else {
                                        headersNbody(hostname._id, function (err, headers, body) {
                                            if (err) {
                                                hostname.headers = null;
                                                hostname.body = null;
                                                hostname.screenshot = null;
                                                hostname.category = 'unknown';
                                                db.collection(hostnamesCol).insert(hostname, function (err) {
                                                    if (err) {console.log(err);}
                                                    cb()
                                                });
                                            }
                                            else {
                                                hostname.headers = headers;
                                                hostname.body = body;
                                                var screenHostname = hostname._id + '.png';
                                                var screen = monitoring.screenshotFolder + '/' + screenHostname;
                                                screenshot(hostname._id, screen, function (err) {
                                                    if (err) {hostname.screenshot = null;}
                                                    else {hostname.screenshot = screenHostname;}
                                                    hostname.category = null;
                                                    db.collection(hostnamesCol).insert(hostname, function (err) {
                                                        if (err) {console.log(err);}
                                                        cb()
                                                    });
                                            });
                                            }
                                        });
                                    }
                                });
                            }
                            else {cb();}
                        },
                        function(err){
                            if (err) {
                                console.log(err);
                                db.close();
                            }
                            else {
                                db.collection(urlsCol).update({integrate:0}, {$set: {integrate: 1}}, {multi:true}, function (err) {
                                    if (err) console.log(err);
                                    console.log('done');
                                    db.close();
                                });
                                 db.close();
                            }
                        }
                    );
                }
            });
        }
    });
}

run(monitoring.DBrecherche, 'urls', 'hostnames', {integrate:0});

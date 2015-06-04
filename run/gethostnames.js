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
            db.collection(urlsCol).aggregate({$match: target},{$group:{_id:'$hostname', date:{$min:'$date'}}},  function(err, hostnames){
                if (err){console.log(err); db.close();}
                else {
                   async.each(
                        hostnames,
                        function(hostname, cb){
                            hostname.category = null;
                            db.collection(hostnamesCol).insert(hostname, function(err){
                                if (err) {console.log(err);}
                                cb()
                            });
                        },
                        function(err){
                            if (err) {console.log(err);}
                            else {
                                db.collection(urlsCol).update({}, {$set: {integrate: 1}}, {multi:true}, function (err) {
                                    if (err) console.log(err);
                                    console.log('done');
                                    db.close();
                                });
                            }
                        }
                    );
                }
            });
        }
    });
}


run(monitoring.DBrecherche, 'urls', 'hostnames', {integrate:0});
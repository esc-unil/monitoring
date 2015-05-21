'use strict';
/**
 * Created by tpineau
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var monitoring = require('../monitoring.json');

var google = require('./../integrate/google.js');
var bing = require('./../integrate/bing.js');
var yahoo = require('./../integrate/yahoo.js');
//var facebook = require('./../integrate/facebook.js');
//var twitter = require('./../integrate/twitter.js');
//var gplus = require('./../integrate/google_plus.js');
var youtube = require('./../integrate/youtube.js');
//var reddit = require('./../integrate/reddit.js');

function run(database, todo){
    //lance le processus de recherche sur les diff�rentes plateformes
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {
            yahoo.getURL(db, {integrate:0}, function(a,b){db.close();console.log('done')});


            /*async.eachSeries(
                todo,
                function (item, callback){
                    requests(db, item, callback);
                },
                function (){
                    db.close();
                    console.log('done');
                }

            )*/
        }
    });
}

run(monitoring.DBrecherche, '');

/*
 google.getURL(db, {integrate:0}, function(a,b){db.close();});
 bing.getURL(db, {integrate:0}, function(a,b){db.close();});
 yahoo.getURL(db, {integrate:0}, function(a,b){db.close();});
 youtube.getURL(db, {integrate:0}, function(a,b){db.close();console.log('done')});
 */

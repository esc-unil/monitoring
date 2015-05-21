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
var facebook = require('./../integrate/facebook.js');
var twitter = require('./../integrate/twitter.js');
var gplus = require('./../integrate/google_plus.js');
var youtube = require('./../integrate/youtube.js');
var reddit = require('./../integrate/reddit.js');

function run(database, col, target, todo){
    //lance le processus de recherche d'urls dans les differentes collections et les integre dans la collection col
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {
            var i = 1;
            async.eachSeries(
                todo,
                function (platform, cb){
                    platform.getURL(db, col, target, function(err){
                        console.log('Platform ' + i.toString() + '/' + todo.length.toString());
                        i++;
                        cb();
                    });
                },
                function (){
                    db.close();
                    console.log('done');
                }
            )
        }
    });
}

var platforms = [
    google,
    bing,
    yahoo,
    facebook,
    twitter,
    gplus,
    youtube,
    reddit
];

run(monitoring.DBrecherche, 'ulrs', {integrate:0}, platforms);



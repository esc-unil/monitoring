'use strict';
/**
 * Created by tpineau
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var keys = require('../keys.json');

if (keys.mongoDB.user != '' && keys.mongoDB.password != ''){var login = keys.mongoDB.user + ':' + keys.mongoDB.password;}
else {var login = '';}
var mongoPath = 'mongodb://' + login + keys.mongoDB.domain + ':' + keys.mongoDB.port + '/' + keys.DBrecherche;

var google = require('./../storage/google.js');
var bing = require('./../storage/bing.js');
var yahoo = require('./../storage/yahoo.js');
var facebook = require('./../storage/facebook.js');
var twitter = require('./../storage/twitter.js');
var gplus = require('./../storage/google_plus.js');
var youtube = require('./../storage/youtube.js');
var reddit = require('./../storage/reddit.js');



mongoClient.connect(mongoPath, function(err, db) {
    if (err){console.log(err);}
    else {
        /*
        google.webSearch(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b.ops[0].result.length);});
        bing.webSearch(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b.ops[0].result.length);});
        yahoo.webSearch(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b.ops[0].result.length);});
        facebook.pagesSearch(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b.ops[0].result.length);});
        twitter.statusSearchNew(db, 'steroid', 200, function (a, b) {db.close(); console.log('done', b.ops.length);});
        twitter.usersSearch(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b.ops[0].result.length);});
        gplus.statusSearchNew(db, 'steroid', 10, function (a, b) {db.close(); console.log('done', b.ops.length);});
        gplus.usersSearch(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b.ops[0].result.length);});
        youtube.searchNew(db, 'steroid', 10, function (a, b) {db.close(); console.log('done', b.ops.length);});
        reddit.searchNew(db, 'steroid', 10, null, function (a, b) {db.close(); console.log('done', b.ops.length);});
        */

    }
});
/*
async.eachSeries(
    ['steroid', 'danabol','winstrol'],
    function(item, cb){
        youtube.searchOld(db,item, 10, function (a, b) {console.log('done', item);cb();});
    },
    function(err){db.close(); console.log('done')}
);
    */
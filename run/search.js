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
var youtube = require('./../storage/youtube.js');
var reddit = require('./../storage/reddit.js');



mongoClient.connect(mongoPath, function(err, db) {
    if (err){console.log(err);}
    else {
        //reddit.searchNew(db, 'steroid', 10, null, function (a, b) {db.close();console.log('done', b);});
        /*
        google.imagesSearch(db,'steroid', 10, function (a, b) {db.close();console.log('done');});
        bing.webSearch(db,'steroid', 10, function (a, b) {db.close();console.log('done');});
        yahoo.webSearch(db,'steroid', 50, function (a, b) {db.close();console.log('done');});
        youtube.searchNew(db, 'steroid', 10, function (a, b) {db.close();console.log('done', b);});
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
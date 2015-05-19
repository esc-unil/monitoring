'use strict';
/**
 * Created by tpineau
 */

var mongoClient = require('mongodb').MongoClient;
var keys = require('../keys.json');

if (keys.mongoDB.user != '' && keys.mongoDB.password != ''){var login = keys.mongoDB.user + ':' + keys.mongoDB.password;}
else {var login = '';}
var mongoPath = 'mongodb://' + login + keys.mongoDB.domain + ':' + keys.mongoDB.port + '/' + keys.DBrecherche;

var google = require('./../storage/google.js');
var bing = require('./../storage/bing.js');
var yahoo = require('./../storage/yahoo.js');
var youtube = require('./../storage/youtube.js');


mongoClient.connect(mongoPath, function(err, db) {
    if (err){console.log(err);}
    else {
        bing.imagesSearch(db,'steroid', 10, function (a, b) {db.close();console.log('done');});
        /*
        google.imagesSearch(db,'steroid', 10, function (a, b) {db.close();console.log('done');});
        youtube.searchNew(db, 'steroid', 10, function (a, b) {db.close();console.log('done');});
        */

    }
});
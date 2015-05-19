'use strict';
/**
 * Created by tpineau
 */

var mongoClient = require('mongodb').MongoClient;
var keys = require('../keys.json');

if (keys.mongoDB.user != '' && keys.mongoDB.password != ''){var login = keys.mongoDB.user + ':' + keys.mongoDB.password;}
else {var login = '';}
var mongoPath = 'mongodb://' + login + keys.mongoDB.domain + ':' + keys.mongoDB.port + '/' + keys.DBrecherche;

var youtube = require('./../storage/youtube.js');


mongoClient.connect(mongoPath, function(err, db) {
    if (err){console.log(err);}
    else {
        /*
        youtube.searchNew(db, 'steroid', 10, function (a, b) {db.close();console.log('done');});
        */

    }
});
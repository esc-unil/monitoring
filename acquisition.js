'use strict';
/**
 * Created by tpineau
 */

var google = require('./clearweb/google.js');
var bing = require('./clearweb/bing.js');
var yahoo = require('./clearweb/yahoo.js');
var facebook = require('./clearweb/facebook.js');
var twitter = require('./clearweb/twitter.js');
var gplus = require('./clearweb/google_plus.js');
var youtube = require('./clearweb/youtube.js');
var reddit = require('./clearweb/reddit.js');

var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;

function dbconnexion(db, url, todo){
    if (todo === undefined) {todo = null;}
    var url = url + db;
    mongoClient.connect(url, function(err, db) {
        if (err) {console.log(err);}
        console.log('Connected correctly to server');
        todo; //à faire une fois connecté
        db.close();
    })
}


dbconnexion('acquisition','mongodb://localhost:27017/', console.log('hello'));

function DBinsert(error, results, callback){

}

//google.webSearch('steroid',10, print);
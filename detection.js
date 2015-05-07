'use strict';
/**
 * Created by tpineau
 */

var google = require('./clearweb/google2.js'); //!!!!!!!!!!
var bing = require('./clearweb/bing.js');
var yahoo = require('./clearweb/yahoo.js');
var facebook = require('./clearweb/facebook.js');
var twitter = require('./clearweb/twitter.js');
var gplus = require('./clearweb/google_plus.js');
var youtube = require('./clearweb/youtube.js');
var reddit = require('./clearweb/reddit.js');

var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;


function insert(col, object, callback){
    //Insere un objet dans une base de donnee (db) mongoDB, dans la collection (col)
    var path = 'mongodb://localhost:27017/';
    var db = 'detection';
    var url =  path + db;
    mongoClient.connect(url, function(err, db) {
        if (err) callback(err);
        console.log('Connected correctly to server');
        var collection = db.collection(col);
        collection.insert(object, function(err){
            if (err) callback(err);
            console.log( object.date + ' -- ' + object.keywords+ ': Inserted request into the ' + col + ' collection (length results: ' + object.result.length.toString() + ')')
            db.close();
            callback(null, object);
        });
        });
}

function googleWebSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    google.webSearch(keyword, num, opt_args, function(err, result){
        if (err) callback(err);
        insert('google', result, callback);
    });
}

function googleImagesSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    google.imagesSearch(keyword, num, opt_args, function(err, result){
        if (err) callback(err);
        insert('google', result, callback);
    });
}



//googleImagesSearch('buy steroid', 1, function(err, res){if (err) console.log(err);})



exports.googleWebSearch = googleWebSearch;
exports.googleImagesSearch = googleImagesSearch;

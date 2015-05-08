'use strict';
/**
 * Created by tpineau
 *
 * Script pour insérer les résultats des requêtes APIs dans une base de donnée MongoDB dans une collection particulière.
 * (db définit dans keys.json)
 */

var keys = require('./keys.json');
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;

if (keys.mongoDB.user != '' && keys.mongoDB.password != ''){var login = keys.mongoDB.user + ':' + keys.mongoDB.password;}
else {var login = '';}
var mongoPath = 'mongodb://' + login + keys.mongoDB.domain + ':' + keys.mongoDB.port + '/'

function insert(col, object, callback){
//Insere un objet dans une base de donnee mongoDB, dans la collection (col)
    var db =  keys.DBdetection;
    var url =  mongoPath + db;
    mongoClient.connect(url, function(err, db) {
        if (err) callback(err);
        else {
            console.log('Connected correctly to server');
            var collection = db.collection(col);
            collection.insert(object, function(err){
                if (err) callback(err);
                else {
                    console.log(object.date + ' -- ' + object.keywords + ': Inserted request into the ' + col + ' collection (length results: ' + object.result.length.toString() + ')')
                    db.close();
                    callback(null, object);
                }
            });
        }
    });
}

exports.insert = insert;
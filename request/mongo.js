'use strict';
/**
 * Created by tpineau
 */

var keys = require('./../keys.json');
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;

function insert(col, object, callback){
//Insere un objet dans une base de donnee mongoDB, dans la collection (col)
    var path = 'mongodb://localhost:27017/';
    var db =  'detection';
    var url =  path + db;
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
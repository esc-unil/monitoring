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
var mongoPath = 'mongodb://' + login + keys.mongoDB.domain + ':' + keys.mongoDB.port + '/' + keys.DBrecherche

function insert(col, object, callback){
//Insere un objet dans une base de donnee mongoDB, dans la collection (col)
    mongoClient.connect(mongoPath, function(err, db) {
        if (err) callback(err);
        else {
            var collection = db.collection(col);
            collection.insert(object, function(err){
                if (err) {
                    db.close();
                    callback(err);
                }
                else {
                    if (object.result != undefined){ var length = object.result.length.toString();} //pour les SEO
                    else {var length = object.length.toString();}
                    console.log(new Date() + ': Inserted request into the ' + col + ' collection (length results: ' + length + ')');
                    db.close();
                    callback(null, object);
                }
            });
        }
    });
}

exports.insert = insert;
exports.mongoPath = mongoPath;

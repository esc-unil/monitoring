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
                    db.close();
                    callback(null, object);
                }
            });
        }
    });
}

function find(col, object, callback){
    mongoClient.connect(mongoPath, function(err, db) {
        if (err) {callback(err);}
        else {
            var collection = db.collection(col);
            collection.find(object).toArray(function(err, docs) {
                if (err) {
                    db.close();
                    callback(err);
                }
                else {
                    db.close();
                    callback(null, docs);
                }
            });

        }
    });
}

function update(col, find, update, callback){
    mongoClient.connect(mongoPath, function(err, db) {
        if (err) {callback(err);}
        else {
            var collection = db.collection(col);
            collection.update(find, update, function(err, result) {
                if (err) {
                    db.close();
                    callback(err);
                }
                else {
                    db.close();
                    callback(null, result);
                }
            });
        }
    });
}

exports.insert = insert;
exports.find = find;
exports.update = update;
exports.ObjectId = mongodb.ObjectID;
exports.mongoPath = mongoPath;

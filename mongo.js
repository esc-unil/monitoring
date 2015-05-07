'use strict';
/**
 * Created by tpineau
 */

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


function insert(db, col, object, callback){
    //Insere un objet dans une base de donnee (db) mongoDB, dans la collection (col)
    var url = 'mongodb://localhost:27017/' + db;
    mongoClient.connect(url, function(err, db) {
        if (err) callback(err);
        console.log('Connected correctly to server');
        var collection = db.collection(col);
        collection.insert(object, function(err){
            if (err) callback(err);
            console.log( object.date + ' --' + object.keywords+ ': Inserted request into the ' + col + ' collection (length results: ' + object.result.length.toString() + ')')
            db.close();
            callback(null, object);
        });
        });

}

exports.dbconnexion = dbconnexion;
exports.insert = insert;

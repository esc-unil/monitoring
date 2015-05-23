'use strict';
/**
 * Created by tpineau
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;

function run(database, col, target, platforms){
    //lance le processus de recherche d'urls dans les differentes collections et les integre dans la collection col
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {

            db.close();
            console.log('done');
        }
    });
}

run(monitoring.DBrecherche, 'hostnames', {integrate:0}, platforms);
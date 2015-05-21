'use strict';
/**
 * Created by tpineau
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var monitoring = require('../monitoring.json');

function run(database, todo){
    //lance le processus de recherche sur les diff�rentes plateformes
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {
            async.eachSeries(
                todo,
                function (item, callback){
                    requests(db, item, callback);
                },
                function (){
                    db.close();
                    console.log('done');
                }
            )
        }
    });
}

function requests(db, item, callback){
    //lance les requetes item.fct pour chaques mots-clefs contenus dans item.keywords
    async.eachSeries(
        item.keywords,
        function (keyword, cb) {
            try {
                item.fct(db, keyword, item.num, item.opt_args, function (err, res) {
                    if (err) {
                        console.log(item.fct.name + '-' + item.keyword + ': erreur');
                    }
                    else {
                        var nbResults = 0;
                        if (res.ops.length === 1) {
                            nbResults = res.ops[0].result.length;
                        }
                        else if (res.ops.length > 1) {
                            nbResults = res.ops.length;
                        }
                        console.log(item.platform + ' > ' + item.fct.name + ' > ' + keyword + ': ' + nbResults);
                    }
                    cb();
                });
            } catch(err) {
                console.log('ERREUR ' + item.platform + ' > ' + item.fct.name + ' > ' + keyword);
                cb();
            }
        },
        function (){
            console.log(item.platform + ' > ' + item.fct.name + ': done');
            console.log('------------------------------------------------------');
            callback()
        }
    );
}

exports.run=run;

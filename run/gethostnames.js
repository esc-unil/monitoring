'use strict';
/**
 * Created by tpineau
 *
 * les 'count' correspondent au nombre d'urls dans la DB en lien avec le hostname
 * (!!! peu compter plusieurs fois chaque url si detecte avec des mots-clefs differents !!!)
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var screenshot = require('../extraction/screenshot').screenshot;

var monitoring = require('../monitoring.json');

function run(database, urlsCol, hostnamesCol, target){
    //lance le processus de recherche d'hostnames dans la collection urlsCOl et les integre dans hostnamesCol
    var login = '';
    if (monitoring.mongoDB.user != '' && monitoring.mongoDB.password != ''){
        login = monitoring.mongoDB.user + ':' + monitoring.mongoDB.password;
    }
    var mongoPath = 'mongodb://' + login + monitoring.mongoDB.domain + ':' + monitoring.mongoDB.port + '/' + database;
    mongoClient.connect(mongoPath, function(err, db) {
        if (err){console.log(err);}
        else {
            db.collection(urlsCol).distinct('hostname', target, function(err, hostnames){
                if (err){console.log(err); db.close();}
                else {
                    var h = hostnames.slice(0,20);
                    async.eachLimit(
                        h,
                        20,
                        function(hostname, cb){
                            db.collection(hostnamesCol).count({hostname: hostname}, function (err, n) {
                                if (err || n!=0){cb();}
                                else if (n === 0){
                                    integrate(db, hostname, hostnamesCol, cb);
                                }
                            });
                        },
                        function(err){
                            if (err) {console.log(err);}
                            else {console.log('done');}
                            db.close();
                        }
                    );
                }
            });

        }
    });
}

function integrate(db, hostname, col, callback){
    var date = new Date();
    var id = hostname + ';' + date.toISOString();
    var obj = {
        _id: id,
        hostname: hostname,
        date: date,
        category: null
    };
    console.log(obj);

    screen(hostname, obj, function(err) {

        db.collection(col).insert(obj, function (err) {
            if (err) {
                callback(err);
            }
            else {
                callback(null);


                //gerer l'update des url ok
            }
        });


    });




}

function screen(hostname, obj, callback){
    var screenHostname = hostname + '_' + obj.date.getTime() + '.jpg';
    var screen = monitoring.screenshotFolder +  '/' + screenHostname;
    screenshot(hostname, screen, function(err) {
        if (err) {obj['screenshot'] = null;}
        else {obj['screenshot'] = screenHostname;}
        callback();
    });
}

function request(hostname, obj, callback){

}

run(monitoring.DBrecherche, 'urls', 'hostnames', {integrate:0});
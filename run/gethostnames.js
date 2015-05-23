'use strict';
/**
 * Created by tpineau
 */

var async = require('async');
var mongoClient = require('mongodb').MongoClient;

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
            db.collection(urlsCol).find(target).sort({date:1}).toArray(function (err, res) {
                if (err) {db.close(); console.log(err);}
                else{
                    async.eachSeries(
                        res,
                        function(item, cb){
                            integrate(db, item, hostnamesCol, function(err){
                                if (err){cb();}
                                else {
                                    db.collection(urlsCol).update({_id: item._id}, {$set: {integrate: 1}}, function(err){
                                        if (err) console.log(item._id, err);
                                        cb();
                                    });
                                }
                            });
                        },
                        function() {db.close(); console.log('done');
                        }
                    );
                }
            });
        }
    });
}

function integrate(db, obj, col, callback){
    db.collection(col).find({_id:obj.hostname}).toArray(function (err, res) {
        if (err) callback(err);
        else {
            res = res[0];
            var platform = {};
            platform[obj.platform] = {date : obj.date, keywords:[obj.keywords]};
            if (res === undefined) {
                var hostname = {
                    _id : obj.hostname,
                    date : obj.date,
                    platforms : [obj.platform],
                    keywords : [obj.keywords],
                    stats : [platform],
                    urls: [obj.url],
                    'class' : null
                };
                db.collection(col).insert(hostname, function(err){callback(err);});
            }
            else{
                console.log(res);









                var add = {$addToSet: {urls: obj.url, platforms: obj.platform, keywords: obj.keywords}};


                db.collection(col).update({_id: obj.hostname}, add, function(err){callback(err);});

            }
        }
    });
}

run(monitoring.DBrecherche, 'urls', 'testcomplexe', {integrate:1}); //!!!a changer
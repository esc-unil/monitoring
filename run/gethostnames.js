'use strict';
/**
 * Created by tpineau
 *
 * les 'count' correspondent au nombre d'urls dans la DB en lien avec le hostname
 * (!!! peu compter plusieurs fois chaque url si detecte avec des mots-clefs differents !!!)
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
                        function() {
                            db.collection(urlsCol).count(target, function (err, res) {
                                if (err || res === 0){
                                    db.close();
                                    console.log('done');
                                }
                                else {run(database, urlsCol, hostnamesCol, target);}
                            });
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
            var stats = {};
            stats[obj.platform] = {date : obj.date, keywords:[obj.keywords], count:1};
            stats[obj.platform][obj.type + '_date'] = obj.date;
            stats[obj.platform][obj.type + '_keywords'] = [obj.keywords];
            stats[obj.platform][obj.type + '_count'] = 1;
            if (res === undefined) { //pas encore eu le hostname
                var hostname = {
                    _id : obj.hostname,
                    date : obj.date,
                    platforms : [obj.platform],
                    keywords : [obj.keywords],
                    urls: [obj.url],
                    count:1,
                    stats : stats,
                    'class' : null
                };
                db.collection(col).insert(hostname, function(err){callback(err);});
            }
            else{
                var add = {$addToSet: {urls: obj.url, platforms: obj.platform, keywords: obj.keywords}, $inc: {count: 1}};
                if (res.stats[obj.platform] === undefined){ //pas encore eu avec cette plateforme
                    add.$set = {};
                    add.$set['stats.' + obj.platform] = stats[obj.platform];
                }
                else { //ajout plateforme dans stats
                    add.$addToSet['stats.' + obj.platform + '.keywords'] = obj.keywords; //ajout keywords pour tout types de recherche
                    add.$inc['stats.' + obj.platform + '.count'] = 1;
                    if (res.stats[obj.platform][obj.type + '_date'] === undefined){ // pas encore le type de recherche pour la plateforme
                        add.$set = {};
                        add.$set['stats.' + obj.platform + '.' + obj.type + '_date'] = obj.date;
                        add.$set['stats.' + obj.platform + '.' + obj.type + '_keywords'] = [obj.keywords];
                        add.$set['stats.' + obj.platform + '.' + obj.type + '_count'] = 1;
                    }
                    else { // ajout keywords pour type particulier
                        add.$addToSet['stats.' + obj.platform + '.' + obj.type + '_keywords'] = obj.keywords;
                        add.$inc['stats.' + obj.platform + '.' + obj.type + '_count'] = 1;
                    }
                }
                db.collection(col).update({_id: obj.hostname}, add, function(err){callback(err);});
            }
        }
    });
}

run(monitoring.DBrecherche, 'urls', 'hostnames', {integrate:0});
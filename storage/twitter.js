'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche sur Twitter
 *
 * Pour statusSearch et userStatus (recherche de tweets par mots-clefs ou par utilisateur, respectivement):
 * Chaques tweets correspond à un objet avec les paramètres suivants:
 *  {
 *    _id :         le numéro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilisés lors de la requête ou l'id de l'utilisateur pour la recherche de postes
 *    date:         la date de la requête
 *    type:         "post"
 *    args:         le/les arguments utilisés lors de la requête
 *    result:       les données du tweet
 *    integrate:    indique si l'objet à déjà été parsé et intégré dans la collection d'URLs (0 si non)
 *  }
 *
 *  Les fonctions statusSearchOld / userStatusOld et statusSearchNew / userStatusNew permettent de rechercher les postes
 *  plus vieux ou plus récents (respectivement) que ceux contenus dans la DB pour un mot-clef ou un utilisateur spécifique.
 *
 *
 * Pour la recherche d'utilisateurs, une recherche correspond à  un objet avec les paramètres suivants:
 * *  {
 *    _id :         le numéro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilisés lors de la requête
 *    date:         la date de la requête
 *    type:         "users"
 *    args:         le/les arguments utilisés lors de la requête
 *    result:       le résultat de la requête (array contenant les données sur les utilisateurs)
 *    integrate:    indique si l'objet à déjà été parsé et intégré dans la collection d'URLs (0 si non)
 *  }
 */

var mongo = require('./../mongodb.js');
var mongoClient = require('mongodb').MongoClient;
var twitter = require('./../api_request/twitter.js');

function statusSearch(keyword, num, opt_args, callback){
// Fonction de recherche de tweets (statuts) sur Twitter et stockage dans la DB dans la collection twitter
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    twitter.statusSearch(keyword, num, opt_args, function(err, response){
        if (err) {callback(err);}
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i].integrate = 0;
                results.push(response[i]);
            }
            if (results.length != 0) {
                mongo.insert('twitter', results, callback);
           }
        }
    });
}

function usersSearch(keyword, num, opt_args, callback){
// Fonction de recherche d'utilisateurs sur Twitter et stockage dans la DB dans la collection twitter
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    twitter.usersSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('twitter', response, callback);
        }
    });
}

function userStatus(id, num, opt_args, callback){
// Fonction de recherche de tweets d'un utilisateur particulier sur Twitter et stockage dans la DB dans la collection twitter
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    twitter.userStatus(id, num, opt_args, function(err, response){
        if (err) {callback(err);}
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i].integrate = 0;
                results.push(response[i]);
            }
            if (results.length != 0) {
                mongo.insert('twitter', results, callback);
            }
        }
    });
}

function statusSearchOld(keyword, num, opt_args, callback){
//Recherche de postes plus vieux que ceux stockés dans la base de donnée MongoDB pour un mot-clef particulier
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    maxid(keyword, function(err, max_id){
        if (err) {callback(err);}
        else {
            if (max_id != null) {opt_args.max_id = max_id;}
            statusSearch(keyword, num, opt_args, callback);
        }
    })
}

function statusSearchNew(keyword, num, opt_args, callback){
//Recherche de postes plus récents que ceux stockés dans la base de donnée MongoDB pour un mot-clef particulier
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    sinceid(keyword, function(err, since_id){
        if (err) {callback(err);}
        else {
            if (since_id != null) {opt_args.since_id = since_id;}
            statusSearch(keyword, num, opt_args, callback);
        }
    })
}

function userStatusOld(id, num, opt_args, callback){
//Recherche de postes plus vieux que ceux stockés dans la base de donnée MongoDB pour un auteur particulier
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    maxid(id, function(err, max_id){
        if (err) {callback(err);}
        else {
            if (max_id != null) {opt_args.max_id = max_id;}
            userStatus(id, num, opt_args, callback);
        }
    })
}

function userStatusNew(id, num, opt_args, callback){
//Recherche de postes plus récents que ceux stockÃ©s dans la base de donnée MongoDB pour un auteur particulier
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    sinceid(id, function(err, since_id){
        if (err) {callback(err);}
        else {
            if (since_id != null) {opt_args.since_id = since_id;}
            userStatus(id, num, opt_args, callback);
        }
    })
}

function sinceid(keyword, callback){
    cursor(-1, keyword, callback);
}

function maxid(keyword, callback){
    cursor(1, keyword, callback);
}

function cursor(cible, keyword, callback){
    mongoClient.connect(mongo.mongoPath, function(err, db) {
        if (err) {callback(err);}
        else {
            var collection = db.collection('twitter');
            collection.count(function(err, n){
                if (n === 0){
                    db.close();
                    callback(null, null);
                }
                else{
                    collection.count({keywords:keyword, type: 'post'}, function(err, n1){
                        if (n1 === 0){
                            db.close();
                            callback(null, null);
                        }
                        else{
                            collection.find({keywords: keyword, type: 'post'}).sort({'result.created_at': cible}).limit(1).toArray(function (err, res) {
                                if (err) {callback(err);}
                                else {
                                    db.close();
                                    console.log(res[0].result.id_str);
                                    callback(null, res[0].result.id_str);
                                }
                            });

                        }
                    });

                }
            });
        }
    });
}

exports.statusSearch = statusSearch;
exports.usersSearch = usersSearch;
exports.userStatus = userStatus;
exports.statusSearchhNew = statusSearchNew;
exports.statusSearchOld = statusSearchOld;
exports.userStatusNew = userStatusNew;
exports.userStatusOld = userStatusOld;


//statusSearchNew('steroid',50, function(err,res){console.log(err);});
//userStatusNew('3140881142', 10, function(err,res){console.log(err);});
//usersSearch('steroid', 50, function(a,b){console.log(a);});
'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche sur Twitter
 *
 * Pour statusSearch et userStatus (recherche de tweets par mots-clefs ou par utilisateur, respectivement):
 * Chaques tweets correspond � un objet avec les param�tres suivants:
 *  {
 *    _id :         le num�ro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilis�s lors de la requ�te ou l'id de l'utilisateur pour la recherche de poste par utilisateur
 *    date:         la date de la requ�te
 *    type:         "post" pour les tweets ou l'id de l'auteur pour un les tweets recherchés pour un auteur spécifique.
 *    args:         le/les arguments utilis�s lors de la requ�te
 *    result:       les donn�es du tweet
 *    integrate:    indique si l'objet � d�j� �t� pars� et int�gr� dans la collection d'URLs (0 si non)
 *  }
 *
 *  Les fonctions statusSearchOld / userStatusOld et statusSearchNew / userStatusNew permettent de rechercher les postes
 *  plus vieux ou plus r�cents (respectivement) que ceux contenus dans la DB pour un mot-clef ou un utilisateur sp�cifique.
 *
 *
 * Pour la recherche d'utilisateurs:
 */

var mongo = require('./../mongodb.js');
var mongoClient = require('mongodb').MongoClient;
var twitter = require('./../api_request/twitter.js');

function statusSearch(keyword, num, opt_args, callback){
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

function userStatus(id, num, opt_args, callback){
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
    maxid(keyword, 'post', function(err, max_id){
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
    sinceid(keyword, 'post', function(err, since_id){
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
    maxid(id, id, function(err, max_id){
        if (err) {callback(err);}
        else {
            if (max_id != null) {opt_args.max_id = max_id;}
            userStatus(id, num, opt_args, callback);
        }
    })
}

function userStatusNew(id, num, opt_args, callback){
//Recherche de postes plus récents que ceux stockés dans la base de donnée MongoDB pour un auteur particulier
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    sinceid(id, id, function(err, since_id){
        if (err) {callback(err);}
        else {
            if (since_id != null) {opt_args.since_id = since_id;}
            userStatus(id, num, opt_args, callback);
        }
    })
}

function sinceid(keyword, type, callback){
    cursor(-1, keyword, type, callback);
}

function maxid(keyword, type, callback){
    cursor(1, keyword, type, callback);
}

function cursor(cible, keyword, type, callback){
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
                    collection.count({keywords:keyword, type: type}, function(err, n1){
                        if (n1 === 0){
                            db.close();
                            callback(null, null);
                        }
                        else{
                            collection.find({keywords: keyword, type: type}).sort({'result.created_at': cible}).limit(1).toArray(function (err, res) {
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
exports.userStatus = userStatus;
exports.statusSearchhNew = statusSearchNew;
exports.statusSearchOld = statusSearchOld;
exports.userStatusNew = userStatusNew;
exports.userStatusOld = userStatusOld;


//statusSearchNew('steroid',5, function(err,res){console.log(err);});


//userStatusNew('3140881142', 1000, function(err,res){console.log(err);});
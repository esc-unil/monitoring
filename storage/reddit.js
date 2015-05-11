'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche de postes sur Reddit et stockage des informations dans une banque de donnée MongoDB
 * dans la collection reddit (les informations sur la DB sont stockées dans le fichier keys.json).
 *
 * Chaques postes correspond à un objet avec les paramètres suivants:
 *  {
 *    _id :         le numéro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilisés lors de la requête
 *    date:         la date de la requête
 *    type:         nom du subreddit ciblé pour la requête (null si non indiqué)
 *    args:         le/les arguments utilisés lors de la requête
 *    result:       les données du poste
 *    integrate:    indique si l'objet à déjà été parsé et intégré dans la collection d'URLs (0 si non)
 *  }
 *
 *  Les fonctions searchAfter et searchBefore permettent de rechercher les postes plus récents ou plus vieux (respectivement)
 *  que ceux contenus dans la DB pour un mot-clef et un subreddit particulier (null pour sans subreddit définit).
 *
 */

var mongo = require('./../mongodb.js');
var mongoClient = require('mongodb').MongoClient;
var reddit = require('./../api_request/reddit.js');

function redditSearch(keyword, num, opt_args, callback) {
// Recherche de messages sur Reddit
// Informations sur les arguments optionnels (opt_args): https://www.reddit.com/dev/api#GET_search
    subredditSearch(keyword, num, null, opt_args, callback);
}

function subredditSearch(keyword, num, subreddit, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    reddit.subredditSearch(keyword, num, subreddit, opt_args, function(err, response){
        if (err) {callback(err);}
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i].integrate = 0;
                results.push(response[i]);
            }
            if (results.length != 0) {
                mongo.insert('reddit', results, callback);
            }
        }
    });
}

function searchAfter(keyword, num, subreddit, opt_args, callback){
//Recherche de postes antérieur au plus vieux stockés dans la base de donnée MongoDB
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    after(keyword, subreddit, function(err, after){
        if (err) {callback(err);}
        else {
            opt_args.after = after;
            subredditSearch(keyword, num, subreddit, opt_args, callback);
        }
    })
}

function searchBefore(keyword, num, subreddit, opt_args, callback){
//Recherche de postes précédents au plus récents stockés dans la base de donnée MongoDB
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    before(keyword, subreddit, function(err, before){
        if (err) {callback(err);}
        else {
            opt_args.before = before;
            subredditSearch(keyword, num, subreddit, opt_args, callback);
        }
    })
}

function after(keyword, subreddit, callback){
    cursor(1, keyword, subreddit, callback);
}

function before(keyword, subreddit, callback){
    cursor(-1, keyword, subreddit, callback);
}

function cursor(cible, keyword, subreddit, callback){
    mongoClient.connect(mongo.mongoPath, function(err, db) {
        if (err) {callback(err);}
        else {
            var collection = db.collection('reddit');
            collection.count(function(err, n){
                if (n === 0){
                    db.close();
                    callback(null, null);
                }
                else{
                    collection.count({keywords:keyword, type: subreddit}, function(err, n1){
                        if (n1 === 0){
                            db.close();
                            callback(null, null);
                        }
                        else{
                            collection.find({keywords: keyword, type: subreddit}).sort({'result.created': cible}).limit(1).toArray(function (err, res) {
                                if (err) {callback(err);}
                                else {
                                    db.close();
                                    console.log(res[0].result.name);
                                    callback(null, res[0].result.name);
                                }
                            });

                        }
                    });

                }
            });
        }
    });
}



exports.redditSearch = redditSearch;
exports.subredditSearch = subredditSearch;
exports.searchBefore = searchBefore;
exports.searchAfter = searchAfter;
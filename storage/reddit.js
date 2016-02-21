'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche de postes sur Reddit et stockage des informations dans une banque de donnée MongoDB
 * dans la collection reddit.
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
 *  Les fonctions searchOld et searchNew permettent de rechercher les postes plus vieux ou plus récents (respectivement)
 *  que ceux contenus dans la DB pour un mot-clef et un subreddit particulier (null pour sans subreddit définit).
 *
 */


var reddit = require('./../api_request/reddit.js');

function redditSearch(db, keyword, num, opt_args, callback) {
    subredditSearch(db, keyword, num, null, opt_args, callback);
}

function subredditSearch(db, keyword, num, subreddit, opt_args, callback){
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
                db.collection('reddit').insert(results, callback);
            }
            else {callback(null, {ops:[]});}
        }
    });
}

function searchOld(db, keyword, num, subreddit, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    cursor(db, 1, keyword, subreddit, function(err, after){
        if (err) {callback(err);}
        else {
            if (after != null) {opt_args.after = after;}
            subredditSearch(db, keyword, num, subreddit, opt_args, callback);
        }
    })
}

function searchNew(db, keyword, num, subreddit, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    cursor(db, -1, keyword, subreddit, function(err, before){
        if (err) {callback(err);}
        else {
            if (before != null) {opt_args.before = before;}
            subredditSearch(db, keyword, num, subreddit, opt_args, callback);
        }
    })
}

function cursor(db, cible, keyword, type, callback){
    db.collection('reddit').count({keywords:keyword, type: type}, function(err, n){
        if (n === 0){callback(null, null);}
        else{
            db.collection('reddit').find({keywords: keyword, type: type}).sort({'result.created': cible}).limit(1).toArray(function (err, res) {
                if (err) {callback(err);}
                else {
                    var resp = res[0].result.name;
                    console.log(resp);
                    callback(null, resp);
                }
            });
        }
    });
}

exports.redditSearch = redditSearch;
exports.subredditSearch = subredditSearch;
exports.searchNew = searchNew;
exports.searchOld = searchOld;

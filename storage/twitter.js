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
 *    keywords:     le/les mots-clefs utilis�s lors de la requ�te ou l'id de l'utilisateur pour la recherche de postes
 *    date:         la date de la requ�te
 *    type:         "post"
 *    args:         le/les arguments utilis�s lors de la requ�te
 *    result:       les donn�es du tweet
 *    integrate:    indique si l'objet � d�j� �t� pars� et int�gr� dans la collection d'URLs (0 si non)
 *  }
 *
 *  Les fonctions statusSearchOld / userStatusOld et statusSearchNew / userStatusNew permettent de rechercher les postes
 *  plus vieux ou plus r�cents (respectivement) que ceux contenus dans la DB pour un mot-clef ou un utilisateur sp�cifique.
 *
 *
 * Pour la recherche d'utilisateurs, une recherche correspond � un objet avec les param�tres suivants:
 * *  {
 *    _id :         le num�ro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilis�s lors de la requ�te
 *    date:         la date de la requ�te
 *    type:         "users"
 *    args:         le/les arguments utilis�s lors de la requ�te
 *    result:       le r�sultat de la requ�te (array contenant les donn�es sur les utilisateurs)
 *    integrate:    indique si l'objet � d�j� �t� pars� et int�gr� dans la collection d'URLs (0 si non)
 *  }
 */

var twitter = require('./../api_request/twitter.js');

function statusSearch(db, keyword, num, opt_args, callback){
// Fonction de recherche de tweets (statuts) sur Twitter et stockage dans la DB
    tweetsSearch(twitter.statusSearch, db, keyword, num, opt_args, callback)
}

function userStatus(db, id, num, opt_args, callback){
// Fonction de recherche de tweets d'un utilisateur particulier sur Twitter et stockage dans la DB
    tweetsSearch(twitter.userStatus, db, id, num, opt_args, callback)
}

function usersSearch(db, keyword, num, opt_args, callback){
// Fonction de recherche d'utilisateurs sur Twitter et stockage dans la DB
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    twitter.usersSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response._id = response.type + ';' + response.keywords + ';' + response.date.toISOString();
            response.integrate = 0;
            db.collection('twitter').insert(response, callback);
        }
    });
}

function statusSearchNew(db, keyword, num, opt_args, callback) {
//Recherche de postes plus r�cents que ceux stock�s dans la base de donn�e MongoDB pour un mot-clef particulier
    searchNew(statusSearch, db, keyword, num, opt_args, callback);
}

function statusSearchOld(db, keyword, num, opt_args, callback) {
//Recherche de postes plus vieux que ceux stock�s dans la base de donn�e MongoDB pour un mot-clef particulier
    searchOld(statusSearch, db, keyword, num, opt_args, callback);
}

function userStatusNew(db, id, num, opt_args, callback) {
//Recherche de postes plus r�cents que ceux stockés dans la base de donn�e MongoDB pour un auteur particulier
    searchNew(userStatus, db, id, num, opt_args, callback);
}

function userStatusOld(db, id, num, opt_args, callback) {
//Recherche de postes plus vieux que ceux stock�s dans la base de donn�e MongoDB pour un auteur particulier
    searchOld(userStatus, db, id, num, opt_args, callback);
}

function tweetsSearch(fct, db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    fct(keyword, num, opt_args, function(err, response){
        if (err) {callback(err);}
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i]._id = response[i].type + ';' + response[i].keywords + ';' + response[i].result.id_str;
                response[i].integrate = 0;
                results.push(response[i]);
            }
            if (results.length != 0) {
                db.collection('twitter').insert(results, callback);
            }
            else {callback(null, {ops:[]});}
        }
    });
}

function searchNew(fct, db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    cursor(db, -1, keyword, function(err, since_id){
        if (err) {callback(err);}
        else {
            if (since_id != null) {opt_args.since_id = since_id;}
            fct(db, keyword, num, opt_args, callback);
        }
    })
}

function searchOld(fct, db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    cursor(db, 1, keyword, function(err, max_id){
        if (err) {callback(err);}
        else {
            if (max_id != null) {opt_args.max_id = max_id;}
            fct(db, keyword, num, opt_args, callback);
        }
    })
}

function cursor(db, cible, keyword, callback){
    db.collection('twitter').count({keywords:keyword, type: 'post'}, function(err, n){
        if (n === 0){callback(null, null);}
        else{
            db.collection('twitter').find({keywords: keyword, type: 'post'}).sort({'result.created_at': cible}).limit(1).toArray(function (err, res) {
                if (err) {callback(err);}
                else {
                    var resp = res[0].result.id_str;
                    console.log(resp);
                    callback(null, resp);
                }
            });
        }
    });
}

exports.statusSearch = statusSearch;
exports.usersSearch = usersSearch;
exports.userStatus = userStatus;
exports.statusSearchNew = statusSearchNew;
exports.statusSearchOld = statusSearchOld;
exports.userStatusNew = userStatusNew;
exports.userStatusOld = userStatusOld;
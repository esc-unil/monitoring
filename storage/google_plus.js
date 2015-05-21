'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche sur Google+
 *
 * Pour statusSearch et userStatus (recherche de postes (activit�s) par mots-clefs ou par utilisateur, respectivement):
 * Chaques postes correspond � un objet avec les param�tres suivants:
 *  {
 *    _id :         le num�ro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilis�s lors de la requ�te ou l'id de l'utilisateur pour la recherche de postes
 *    date:         la date de la requ�te
 *    type:         "post"
 *    args:         le/les arguments utilis�s lors de la requ�te
 *    result:       les donn�es du poste
 *    integrate:    indique si l'objet � d�j� �t� pars� et int�gr� dans la collection d'URLs (0 si non)
 *  }
 *
 *  Les fonctions statusSearchNew / userStatusNew permettent de rechercher les postes
 *  plus r�cents que ceux contenus dans la DB pour un mot-clef ou un utilisateur sp�cifique.
 *
 *
 * Pour la recherche d'utilisateurs ou de pages, une recherche correspond � un objet avec les param�tres suivants:
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

var gplus = require('./../api_request/google_plus.js');

function statusSearch(db, keyword, num, opt_args, callback){
// Fonction de recherche d'activit�s sur Google+ et stockage dans la DB
    activitiesSearch(gplus.statusSearch, db, keyword, num, opt_args, callback)
}

function userStatus(db, id, num, opt_args, callback){
// Fonction de recherche d'activit�s d'un utilisateur particulier et stockage dans la DB (num = 20, max)
    activitiesSearch(gplus.userStatus, db, id, num, opt_args, callback)
}

function usersSearch(db, keyword, num, opt_args, callback){
// Fonction de recherche d'utilisateurs ou de pages sur Google+ et stockage dans la DB
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    gplus.usersSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response._id = response.type + ';' + response.keywords + ';' + response.date.toISOString();
            response.integrate = 0;
            db.collection('google_plus').insert(response, callback);
        }
    });
}

function statusSearchNew(db, keyword, num, opt_args, callback){
// Fonction de recherche d'activit�s plus r�cente que celle de la DB pour un mot-clef particulier
    searchNew(gplus.statusSearch, db, keyword, num, opt_args, callback);
}

function userStatusNew(db, id, num, opt_args, callback){
// Fonction de recherche d'activit�s plus r�cente que celle de la DB pour un utilisateur particulier (num = 20, max)
    searchNew(gplus.userStatus, db, id, num, opt_args, callback);
}

function activitiesSearch(fct, db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    fct(keyword, num, opt_args, function(err, response){
        if (err) {callback(err);}
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i]._id = response[i].type + ';' + response[i].keywords + ';' + response[i].result.id;
                response[i].integrate = 0;
                results.push(response[i]);
            }
            if (results.length != 0) {
                db.collection('google_plus').insert(results, callback);
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
    dateLastPost(db, keyword, function(err, lastPost) {
        if (err) {
            console.log(err);
        }
        else {
            fct(keyword, num, opt_args, function (err, response) {
                if (err) {
                    callback(err);
                }
                else {
                    var results = [];
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].result.published > lastPost) {
                            response[i]._id = response[i].type + ';' + response[i].keywords + ';' + response[i].result.id;
                            response[i].integrate = 0;
                            results.push(response[i]);
                        }
                    }
                    if (results.length != 0) {
                        db.collection('google_plus').insert(results, callback);
                    }
                    else {callback(null, {ops:[]});}
                }
            });
        }
    });
}

function dateLastPost(db, keyword, callback){
    db.collection('google_plus').count({keywords: keyword, type: 'post'}, function(err, n){
        if (n === 0){callback(null, null);}
        else{
            db.collection('google_plus').find({keywords: keyword, type: 'post'}).sort({'result.published': -1}).limit(1).toArray(function (err, res) {
                if (err) {callback(err);}
                else {
                    var resp = res[0].result.published;
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
exports.userStatusNew = userStatusNew;
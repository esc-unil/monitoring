'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche sur Youtube et stockage des informations dans une banque de donn�e MongoDB
 * dans la collection youtube.
 *
 * Chaque vid�o correspond � un objet avec les param�tres suivants:
 *
 *  {
 *    _id :         le num�ro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilis�s lors de la requ�te
 *    date:         la date de la requ�te
 *    type:         "videos"
 *    args:         le/les arguments utilis�s lors de la requ�te
 *    result:       les donn�es de la vid�o
 *    integrate:    indique si l'objet � d�j� �t� pars� et int�gr� dans la collection d'URLs (0 si non)
 *  }
 *
 * Les fonctions searchOld et searchNew permettent de rechercher les vid�os plus vielles ou plus r�centes (respectivement)
 * que celles contenues dans la DB pour un mot-clef particulier.
 */

var youtube = require('./../api_request/youtube.js');

function videosSearch(db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    youtube.videosSearch(keyword, num, opt_args, function(err, response){
        if (err) {callback(err);}
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i]._id = response[i].type + ';' + response[i].keywords + ';' + response[i].result.id.videoId;
                response[i].integrate = 0;
                results.push(response[i]);
            }
            if (results.length != 0) {
                db.collection('youtube').insert(results, callback);
            }
            else {callback(null, {ops:[]});}
        }
    });
}

function searchOld(db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    cursor(db, 1, keyword, 'videos', function(err, publishedBefore){
        if (err) {callback(err);}
        else {
            if (publishedBefore != null) {opt_args.publishedBefore = publishedBefore;}
            videosSearch(db, keyword, num, opt_args, callback);
        }
    })
}

function searchNew(db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    cursor(db, -1, keyword, 'videos', function(err, publishedAfter){
        if (err) {callback(err);}
        else {
            if (publishedAfter != null) {opt_args.publishedAfter = publishedAfter;}
            videosSearch(db, keyword, num, opt_args, callback);
        }
    })
}

function cursor(db, cible, keyword, type, callback){
    db.collection('youtube').count({keywords:keyword, type: type}, function(err, n){
        if (n === 0){callback(null, null);}
        else{
            db.collection('youtube').find({keywords: keyword, type: type}).sort({'result.snippet.publishedAt': cible}).limit(1).toArray(function (err, res) {
                if (err) {callback(err);}
                else {
                    var resp = res[0].result.snippet.publishedAt.toISOString();
                    console.log(resp);
                    callback(null, resp);
                }
            });
        }
    });
}

exports.videosSearch = videosSearch;
exports.searchNew = searchNew;
exports.searchOld = searchOld;

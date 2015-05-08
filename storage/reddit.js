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
 */

var mongo = require('./../mongodb.js');
var reddit = require('./../api_request/reddit.js');

function redditSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    reddit.redditSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            var results = [];
            for (var i = 0; i < response.length; i++) {
                response[i].integrate = 0;
                results.push(response[i]);
            }
            mongo.insert('reddit', results, callback);
        }
    });
}

exports.redditSearch = redditSearch;

redditSearch("steroid", 100, function(err, res){console.log(err);});
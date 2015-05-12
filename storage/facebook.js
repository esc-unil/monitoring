'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche sur Facebook et stockage des informations dans une banque de donnée MongoDB
 * dans la collection facebook (les informations sur la DB sont stockées dans le fichier keys.json).
 * une recherche correspond à un objet avec les paramètres suivants:
 *
 *  {
 *    _id :         le numéro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilisés lors de la requête
 *    date:         la date de la requête
 *    type:         "pages" ou "places" selon si la requête ciblée les pages ou les lieux
 *    args:         le/les arguments utilisés lors de la requête
 *    result:       le résultat de la requête (array contenant les données des pages/lieux)
 *    integrate:    indique si l'objet à déjà été parsé et intégré dans la collection d'URLs (0 si non)
 *  }
 *
 */

var mongo = require('./../mongodb.js');
var facebook = require('./../api_request/facebook.js');

function pagesSearch(keyword, num, opt_args, callback){
// Fonction de recherche de page sur Facebook et stockage des résultats dans la DB, dans la collection facebook
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    facebook.pagesSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('facebook', response, callback);
        }
    });
}

function placesSearch(keyword, num, opt_args, callback){
// Fonction de recherche de lieux sur Facebook et stockage des résultats dans la DB, dans la collection facebook
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    facebook.placesSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('facebook', response, callback);
        }
    });
}

exports.pagesSearch = pagesSearch;
exports.placesSearch = placesSearch;
'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche via l'API Google et stockage des informations dans une banque de donnée MongoDB
 * dans la collection google (les informations sur la DB sont stockées dans le fichier keys.json).
 * une recherche correspond à un objet avec les paramètres suivants:
 *  {
 *    _id :         le numéro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilisés lors de la requête
 *    date:         la date de la requête
 *    args:         le/les arguments utilisés lors de la requête
 *    type:         le type de requête (web ou images)
 *    result:       le résultat de la requête (array contenant les éléments)
 *    integrate:    indique si l'objet à déjà été intégré dans la collection d'URLs (0 si non)
 *  }
 */

var google = require('./../api_request/google.js');

function webSearch(db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    google.webSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            var result = [];
            for (var i = 0; i < response.result.length; i++) {
                delete response.result[i].pagemap;
                result.push(response.result[i]);
            }
            response.result = result;
            response.integrate = 0;
            db.collection('google').insert(response, callback);
        }
    });
}

function imagesSearch(db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    google.imagesSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            var result = [];
            for (var i = 0; i < response.result.length; i++) {
                delete response.result[i].pagemap;
                result.push(response.result[i]);
            }
            response.result = result;
            response.integrate = 0;
            db.collection('google').insert(response, callback);
        }
    });
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
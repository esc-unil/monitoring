'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche via l'API bing et stockage des informations dans une banque de donnée MongoDB
 * dans la collection bing.
 * une recherche correspond à un objet avec les paramètres suivants:
 *  {
 *    _id :         le numéro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilisés lors de la requête
 *    date:         la date de la requête
 *    args:         le/les arguments utilisés lors de la requête
 *    type:         le type de requête (web, images ou videos)
 *    result:       le résultat de la requête (array contenant les éléments)
 *    integrate:    indique si l'objet à déjà été intégré dans la collection d'URLs (0 si non)
 *  }
 */

var bing = require('./../api_request/bing.js');

function webSearch(db, keyword, num, opt_args, callback){
    search(bing.webSearch, db, keyword, num, opt_args, callback);
}

function imagesSearch(db, keyword, num, opt_args, callback){
    search(bing.imagesSearch, db, keyword, num, opt_args, callback);
}

function videosSearch(db, keyword, num, opt_args, callback){
    search(bing.videosSearch, db, keyword, num, opt_args, callback);
}

function search(fct, db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    fct(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            db.collection('bing').insert(response, callback);
        }
    });
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
exports.videosSearch = videosSearch;
'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche via l'API Yahoo et stockage des informations dans une banque de donnée MongoDB
 * dans la collection yahoo.
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

var yahoo = require('./../api_request/yahoo.js');

function webSearch(db, keyword, num, opt_args, callback){
    search(yahoo.webSearch, db, keyword, num, opt_args, callback);
}

function imagesSearch(db, keyword, num, opt_args, callback){
    search(yahoo.imagesSearch, db, keyword, num, opt_args, callback);
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
            db.collection('yahoo').insert(response, callback(null, response.result.length));
        }
    });
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
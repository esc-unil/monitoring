'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche sur Facebook et stockage des informations dans une banque de donn�e MongoDB
 * dans la collection facebook.
 * une recherche correspond � un objet avec les param�tres suivants:
 *
 *  {
 *    _id :         le num�ro d'identification de l'objet
 *    keywords:     le/les mots-clefs utilis�s lors de la requ�te
 *    date:         la date de la requ�te
 *    type:         "pages" ou "places" selon si la requ�te cibl�e les pages ou les lieux
 *    args:         le/les arguments utilis�s lors de la requ�te
 *    result:       le r�sultat de la requ�te (array contenant les donn�es des pages/lieux)
 *    integrate:    indique si l'objet � d�j� �t� pars� et int�gr� dans la collection d'URLs (0 si non)
 *  }
 *
 */

var facebook = require('./../api_request/facebook.js');

function pagesSearch(db, keyword, num, opt_args, callback){
    search(facebook.pagesSearch, db, keyword, num, opt_args, callback);
}

function placesSearch(db, keyword, num, opt_args, callback){
    search(facebook.placesSearch, db, keyword, num, opt_args, callback);
}

function search(fct, db, keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    fct(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response._id = response.type + ';' + response.keywords + ';' + response.date.toISOString();
            response.integrate = 0;
            db.collection('facebook').insert(response, callback);
        }
    });
}

exports.pagesSearch = pagesSearch;
exports.placesSearch = placesSearch;
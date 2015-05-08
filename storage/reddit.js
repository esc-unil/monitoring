'use strict';
/**
 * Created by tpineau
 *
 * Script de recherche de postes sur Reddit et stockage des informations dans une banque de donnée MongoDB
 * dans la collection reddit (les informations sur la DB sont stockées dans le fichier keys.json).
 *
 *
 */

var mongo = require('./../mongodb.js');
var reddit = require('./../api_request/reddit.js');

function redditSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    reddit.redditSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('reddit', response, callback);
        }
    });
}

exports.redditSearch = redditSearch;

redditSearch("steroid", 5, function(err, res){console.log(JSON.stringify(res));});
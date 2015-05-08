'use strict';
/**
 * Created by tpineau
 */

var mongo = require('./mongo.js');
var google = require('./../api_request/google.js');

function webSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    google.webSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            var result = [];
            for (var i = 0; i < response.result.length; i++) { //retire le pagemap non utilisé et faisant planter l'intégration dans mongodb
                delete response.result[i].pagemap;
                result.push(response.result[i]);
            }
            response.result = result;
            response.integrate = 0;
            mongo.insert('google', response, callback);
        }
    });
}

function imagesSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    google.imagesSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            var result = [];
            for (var i = 0; i < response.result.length; i++) { //retire le pagemap non utilisé et faisant planter l'intégration dans mongodb
                delete response.result[i].pagemap;
                result.push(response.result[i]);
            }
            response.result = result;
            response.integrate = 0;
            mongo.insert('google', response, callback);
        }
    });
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
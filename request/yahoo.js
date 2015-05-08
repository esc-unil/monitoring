'use strict';
/**
 * Created by tpineau
 */

var mongo = require('./mongo.js');
var yahoo = require('./../api_request/yahoo.js');

function yahooWebSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    yahoo.webSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('yahoo', response, callback);
        }
    });
}

function yahooImagesSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    yahoo.imagesSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('yahoo', response, callback);
        }
    });
}

exports.yahooWebSearch = yahooWebSearch;
exports.yahooImagesSearch = yahooImagesSearch;

yahooImagesSearch('buy steroid', 50, function(err, res){if (err) console.log(err)})
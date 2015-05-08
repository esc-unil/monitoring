'use strict';
/**
 * Created by tpineau
 */

var mongo = require('./mongo.js');
var bing = require('./../api_request/bing.js');

function webSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    bing.webSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('bing', response, callback);
        }
    });
}

function imagesSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    bing.imagesSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('bing', response, callback);
        }
    });
}

function videosSearch(keyword, num, opt_args, callback){
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    bing.videosSearch(keyword, num, opt_args, function(err, response){
        if (err) callback(err);
        else {
            response.integrate = 0;
            mongo.insert('bing', response, callback);
        }
    });
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
exports.videosSearch = videosSearch;

videosSearch('steroid', 50, function(err, res){if (err) console.log(err)});
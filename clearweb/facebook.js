'use strict';
/**
 * Created by Thomas
 */

var querystring = require('querystring');
var request = require('request');
var extend = require('extend');
var async = require("async");
var keys = require('./../keys.json');

// application token (only for places and pages search) / users, events and groups possible with limited information and special token (available 1 hour)
var facebookKey = keys.facebookKey;
var facebookSecret = keys.facebookSecret;


function pagesSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de page sur Facebook
// Informations sur les arguments optionnels (opt_args): https://developers.facebook.com/docs/graph-api/using-graph-api/v2.3
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = null;}
    var args = {q: keyword, limit: num, type:'page', access_token: facebookKey + '|' + facebookSecret};
    extend(args, opt_args);
    search(args, callback);
}

function placesSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de lieux sur Facebook
// Informations sur les arguments optionnels (opt_args): https://developers.facebook.com/docs/graph-api/using-graph-api/v2.3
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = null;}
    var args = {q: keyword, limit: num, type:'place', access_token: facebookKey + '|' + facebookSecret};
    extend(args, opt_args);
    search(args, callback);
}

function search(args, callback) {
// recherche en utilisant l'API de facebook
    var webSearchUrl = 'https://graph.facebook.com/v2.3/search?';
    var options = querystring.stringify(args, '&');
    var url = webSearchUrl + options;
    request(url, function (err, response, body) {
        if (err) {callback(err);}
        var data = JSON.parse(body).data;
        if (!err && response.statusCode == 200) {
            //callback(null, data);
            async.concatSeries(
                data,
                function (item, callback) {
                    searchID(item.id, args.access_token, callback);
                },
                function (err, result) {
                    if (err) callback(err);
                    callback(null, result);
                }
            );
        }
    });
}


function searchID(id, accessToken, callback){
    var url = 'https://graph.facebook.com/v2.3/' + id + '?access_token=' + accessToken;
    request(url, function (err, response, body) {
        if (err) {callback(err);}
        var result = JSON.parse(body);
        if (!err && response.statusCode == 200) {callback(null, result);}
    });
}

exports.pagesSearch = pagesSearch;
exports.placesSearch = placesSearch;
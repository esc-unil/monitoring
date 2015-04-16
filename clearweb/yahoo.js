'use strict';
/**
 * Created by tpineau
 */
    
var querystring = require('querystring');
var extend = require('extend');
var async = require("async");
var oAuth = require('oauth');
var keys = require('./../keys.json');

var yahooKey = keys.yahooKey;
var yahooSecret = keys.yahooSecret;

function webSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de page web via Yahoo
// Informations sur les arguments optionnels (opt_args): https://developer.yahoo.com/boss/search/boss_api_guide/web.html
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {q: keyword, count: num, format: 'json'};
    extend(args, opt_args);
    go('web', args, function (err, response) {
        if (err) callback(err);
        var results = [];
        for (var i = 0; i < response.length; i++) {
            var obj = {request: {}};
            obj.url = response[i].url;
            obj.request.type = 'web';
            obj.request.keyword = keyword;
            obj.request.ranking = i + 1;
            obj.request.platform = 'Yahoo';
            obj.request.date = new Date();
            obj.request.args = opt_args;
            results.push(obj);
        }
        callback(null, results);
    });
}

function imagesSearch(keyword, num, opt_args, callback) {
// Fonction de recherche d'images via Yahoo
// Informations sur les arguments optionnels (opt_args): https://developer.yahoo.com/boss/search/boss_api_guide/image.html
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {q: keyword, count: num, format: 'json'};
    extend(args, opt_args);
    go('images', args, function (err, response) {
        if (err) callback(err);
        var results = [];
        for (var i = 0; i < response.length; i++) {
            var obj = {request: {}};
            obj.url = response[i].refererurl;
            obj.image = response[i].url;
            obj.request.type = 'image';
            obj.request.keyword = keyword;
            obj.request.ranking = i + 1;
            obj.request.platform = 'Yahoo';
            obj.request.date = new Date();
            obj.request.args = opt_args;
            results.push(obj);
        }
        callback(null, results);
    });
}

function go(type, args, callback) {
// lance le nombre de requêtes search afin d'obtenir le nombre de resultat souhaités
    var arr = listRequest(type, args);
    async.concatSeries(arr,
        function (item, callback) {
            args.count = item.num;
            args.start = item.start;
            search(type, args, callback);
        },
        function (err, response) {
            if (err) callback(err);
            callback(null, response);
        }
    );
}

function search(type, args, callback) {
// recherche en utilisant l'API BOSS de Yahoo
    var webSearchUrl = 'https://yboss.yahooapis.com/ysearch/' + type;
    var options = querystring.stringify(args);
    var finalUrl = webSearchUrl + '?' + options
    var oa = new oAuth.OAuth(webSearchUrl, finalUrl, yahooKey, yahooSecret, "1.0", null, "HMAC-SHA1");
    oa.setClientOptions({requestTokenHttpMethod: 'GET'});
    oa.getProtectedResource(finalUrl, "GET", '', '', function (err, data, response) {
        if (err) callback(err);
        data = JSON.parse(data);
        if (type === 'web') {
            callback(null, data.bossresponse.web.results);
        }
        else if (type === 'images') {
            callback(null, data.bossresponse.images.results);
        }
        else {
            callback(null, data);
        }
    });
}

function listRequest(type, args) {
// Permet de depasser la limitation de résultat des requêtes (web: 50 et images:35), 1000 au max!
    var num = args.count;
    if (num > 1000) {
        num = 1000;
    }
    if (type == 'web') {
        var max = 50;
    }
    else if (type == 'images') {
        var max = 35;
    }
    else {
        var max = 50;
    }
    var nbRequest = Math.ceil(num / max);
    var table = [];
    for (var i = 1; i <= nbRequest; i++) {
        if (i == nbRequest) {
            if (num % 10 === 0) {
                c = max;
            }
            else {
                var c = num % max;
            }
        }
        else {
            var c = max;
        }
        table.push({num: c, start: (i - 1) * max});
    }
    return table;
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
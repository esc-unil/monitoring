'use strict';

/*
 auteur: tpineau
 */

var querystring = require('querystring');
var request = require('request');
var extend = require('extend');
var async = require("async");
var keys = require('./keys.json');

var bingKey = keys.bingKey;

function webSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de page web via Bing
// Informations sur les arguments optionnels (opt_args): https://datamarket.azure.com/dataset/bing/search#schema 
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {Query: '\'' + keyword + '\'', top: num, format: 'json'};
    extend(args, opt_args);
    go('Web', args, function (err, response) {
        if (err) callback(err);
        var results = [];
        for (var i = 0; i < response.length; i++) {
            var obj = {request: {}};
            obj.url = response[i].Url;
            obj.request.type = 'web';
            obj.request.keyword = keyword;
            obj.request.ranking = i + 1;
            obj.request.platform = 'Bing';
            obj.request.date = new Date();
            obj.request.args = opt_args;
            results.push(obj);
        }
        callback(null, results);
    });
}

function imagesSearch(keyword, num, opt_args, callback) {
// Fonction de recherche d'images via Google
// Informations sur les arguments optionnels (opt_args): https://datamarket.azure.com/dataset/bing/search#schema
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {Query: '\'' + keyword + '\'', top: num, format: 'json'};
    extend(args, opt_args);
    go('Image', args, function (err, response) {
        if (err) callback(err);
        var results = [];
        for (var i = 0; i < response.length; i++) {
            var obj = {request: {}};
            obj.url = response[i].SourceUrl;
            obj.image = response[i].MediaUrl;
            obj.request.type = 'image';
            obj.request.keyword = keyword;
            obj.request.ranking = i + 1;
            obj.request.platform = 'Bing';
            obj.request.date = new Date();
            obj.request.args = opt_args;
            results.push(obj);
        }
        callback(null, results);
    });
}

function videosSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de videos via Google
// Informations sur les arguments optionnels (opt_args): https://datamarket.azure.com/dataset/bing/search#schema
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {Query: '\'' + keyword + '\'', top: num, format: 'json'};
    extend(args, opt_args);
    go('Video', args, function (err, response) {
        if (err) callback(err);
        var results = [];
        for (var i = 0; i < response.length; i++) {
            var obj = {request: {}};
            obj.url = response[i].MediaUrl;
            obj.request.type = 'video';
            obj.request.keyword = keyword;
            obj.request.ranking = i + 1;
            obj.request.platform = 'Bing';
            obj.request.date = new Date();
            obj.request.args = opt_args;
            results.push(obj);
        }
        callback(null, results);
    });
}


function go(type, args, callback) {
// lance le nombre de requêtes search afin d'obtenir le nombre de resultat souhaités
    var arr = listRequest(args);
    async.concatSeries(arr,
        function (item, callback) {
            args.top = item.num;
            args.skip = item.start;
            search(type, args, callback);
        },
        function (err, response) {
            if (err) callback(err);
            callback(null, response);
        }
    );
}


function search(type, args, callback) {
// recherche en utilisant l'API Search de Bing
    var webSearchUrl = 'https://Basic:' + bingKey + '@api.datamarket.azure.com/Data.ashx/Bing/Search/' + type + '?';
    var args = querystring.stringify(args, '&$');
    var url = webSearchUrl + args;
    var req = request(url, function (err, response, body) {
        if (err) {
            callback(err)
        }
        ;
        var result = JSON.parse(body).d.results;
        if (!err && response.statusCode == 200) {
            callback(null, result);
        }
    })
}


function listRequest(args) {
// Permet de depasser la limitation de résultat des requêtes (10 par requête)
    var num = args.top;
    var nbRequest = Math.ceil(num / 50);
    var table = [];
    for (var i = 1; i <= nbRequest; i++) {
        if (i == nbRequest) {
            if (num % 50 === 0) {
                c = 50;
            }
            else {
                var c = num % 50;
            }
        }
        else {
            var c = 50;
        }
        table.push({num: c, start: (i - 1) * 50});
    }
    return table;
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
exports.videosSearch = videosSearch;
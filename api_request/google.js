'use strict';
/**
 * Created by tpineau
 */

var extend = require('extend');
var async = require("async");
var googleapis = require('googleapis');
var keys = require('./../keys.json');

var customsearch = googleapis.customsearch('v1');
var googleSearchEngine = keys.googleSearchEngine;
var googleKey = keys.googleKey;

function webSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de page web via Google
// Informations sur les arguments optionnels (opt_args): https://developers.google.com/custom-search/json-api/v1/reference/cse/list?hl=FR
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {q: keyword, num: num, auth: googleKey, cx: googleSearchEngine};
    extend(args, opt_args);
    go(args, function (err, response) {
        if (err) callback(err);
        else {
            delete args.auth;
            delete args.cx;
            var results = {
                keywords: keyword,
                date: new Date(),
                type: 'web',
                args: args,
                result: response
            };
            callback(null, results);
        }
    });
}

function imagesSearch(keyword, num, opt_args, callback) {
// Fonction de recherche d'images via Google
// Informations sur les arguments optionnels (opt_args): https://developers.google.com/custom-search/json-api/v1/reference/cse/list?hl=FR
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = null;
    }
    var args = {q: keyword, num: num, auth: googleKey, cx: googleSearchEngine, searchType: 'image'};
    extend(args, opt_args);
    go(args, function (err, response) {
        if (err) callback(err);
        else {
            delete args.auth;
            delete args.cx;
            var results = {
                keywords: keyword,
                date: new Date(),
                type: 'images',
                args: args,
                result: response
            };
            callback(null, results);
        }
    });
}

function go(args, callback) {
// lance le nombre de requêtes search afin d'obtenir le nombre de resultat souhaités
    var arr = listRequest(args);
    async.concatSeries(arr,
        function (item, callback) {
            args.num = item.num;
            args.start = item.start;
            setTimeout(function () {
                search(args, callback);
            }, 1000);
        },
        function (err, response) {
            if (err) {callback(err);}
            else {callback(null, response);}
        }
    );
}

function search(args, callback) {
// recherche en utilisant l'API Custom Search Engine de Google
    customsearch.cse.list(args, function (err, data) {
        if (err) {callback(err);}
        else {callback(null, data.items);}
    });
}

function listRequest(args) {
// Permet de depasser la limitation de résultat des requêtes (10 par requête)
    var num = args.num;
    var nbRequest = Math.ceil(num / 10);
    var table = [];
    for (var i = 1; i <= nbRequest; i++) {
        if (i == nbRequest) {
            if (num % 10 === 0) {c = 10;}
            else {var c = num % 10;}
        }
        else {var c = 10;}
        table.push({num: c, start: (i - 1) * 10 + 1});
    }
    return table;
}

exports.webSearch = webSearch;
exports.imagesSearch = imagesSearch;
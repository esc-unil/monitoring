'use strict';
/**
 * Created by tpineau
 */

var extend = require('extend');
var async = require("async");
var googleapis = require('googleapis');
var keys = require('./../keys.json');

var youtube = googleapis.youtube('v3');

var googleKey = keys.googleKey;

function videosSearch(keyword, num, opt_args, callback) {
// Fonction de recherche de vidéos sur Youtube
// Informations sur les arguments optionnels (opt_args): https://developers.google.com/youtube/v3/docs/search/list
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {q: keyword, maxResults: num, part: 'snippet', auth: googleKey};
    if (opt_args.order === undefined) {opt_args.order = 'date';}
    if (opt_args.pageToken === undefined) {opt_args.pageToken = null;}
    if (opt_args.type === undefined) {opt_args.type = 'video';}
    extend(args, opt_args);
    go(args, callback);
}

function go(args, callback) {
    var args = args;
    var arr = listRequest(args);
    async.concatSeries(
        arr,
        function (item, callback) {
            args.maxResults = item.num;
            setTimeout(function () {
                search(args, function(err, data, nextRequest) {
                    if (err) {
                        callback();
                    }
                    else {
                        if (data.length < 40) {args.pageToken = 'STOP';}
                        else {args.pageToken = nextRequest;}
                        callback(null, data);
                    }
                });
            }, 0.4);
        },
        function (err, response) {
            if (err) {
                callback(err);
            }
            else {
                delete args.auth;
                if (args.pageToken === 'STOP'){delete args.pageToken}
                var results = [];
                for (var i = 0; i < response.length; i++) {
                    var post = response[i];
                    if (((i > 0 && post.id.videoId != response[i - 1].id.videoId) || (i === 0)) &&
                        post.snippet.publishedAt != args.publishedBefore && post.snippet.publishedAt != args.publishedAfter) {

                        post.snippet.publishedAt = new Date(post.snippet.publishedAt); // formate la date publishedAt dans un format Date
                        var result = {
                            keywords: args.q,
                            date: new Date(),
                            type: args.type + 's',
                            args: args,
                            result: post
                        };
                        results.push(result);
                    }
                }
                callback(null, results);
            }
        }
    );
}

function search(args, callback) {
// recherche en utilisant l'API Youtube data de Google
    if (args.pageToken === 'STOP'){callback(null, []);}
    else {
        youtube.search.list(args, function (err, data) {
            if (err) {callback(err);}
            else {callback(null, data.items, data.nextPageToken);}
        });
    }
}

function listRequest(args) {
// Permet de depasser la limitation de résultat des requêtes (50 par requête)
    var num = args.maxResults;
    var nbRequest = Math.ceil(num / 50);
    var table = [];
    for (var i = 1; i <= nbRequest; i++) {
        if (i == nbRequest) {
            if (num % 50 === 0) {c = 50;}
            else {var c = num % 50;}
        }
        else {var c = 50;}
        table.push({num: c});
    }
    return table;
}

exports.videosSearch = videosSearch;

'use strict';
/**
 * Created by tpineau
 */

var extend = require('extend');
var async = require("async");
var googleapis = require('googleapis');
var keys = require('./../keys.json');

var plus = googleapis.plus('v1');

var googleKey = keys.googleKey;


function statusSearch(keyword, num, opt_args, callback) {
// Fonction de recherche d'activités (statuts) sur Google+
// Informations sur les arguments optionnels (opt_args): https://developers.google.com/+/api/latest/activities/search?hl=fr
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {query: keyword, maxResults: num, auth: googleKey};
    if (opt_args.orderBy === undefined) {opt_args.orderBy = 'recent';}
    if (opt_args.pageToken === undefined) {opt_args.pageToken = null;}
    extend(args, opt_args);
    go('activities', args, callback);
}

function usersSearch(keyword, num, opt_args, callback) {
// Fonction de recherche d'utilisateurs sur Google+
// Informations sur les arguments optionnels (opt_args): https://developers.google.com/+/api/latest/people/search?hl=fr
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {query: keyword, maxResults: num, auth: googleKey};
    if (opt_args.pageToken === undefined) {opt_args.pageToken = null;}
    extend(args, opt_args);
    go('people', args, callback);
}

function userStatus(id, num, opt_args, callback) {
// Fonction de recherche d'activités d'un utilisateur particulier sur Google+
// Informations sur les arguments optionnels (opt_args): https://developers.google.com/+/api/latest/activities/list?hl=fr
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {userId: id, maxResults: num, collection:'public', auth: googleKey};
    if (opt_args.pageToken === undefined) {opt_args.pageToken = null;}
    extend(args, opt_args);
    go('activitiesUser', args, callback);
}


function go(type, args, callback) {
    var args = args;
    var arr = listRequest(type, args);
    async.concatSeries(
        arr,
        function (item, callback) {
            args.maxResults = item.num;
            setTimeout(function () {
                search(type, args, function(err, data, nextRequest){
                    if (err) {callback();}
                    else {
                        if (type === 'activities' || type === 'people'){var max = 15;}
                        else if (type === 'activitiesUser') {var max = 90;}
                        if (data.length < max) {args.pageToken = 'STOP'}
                        else {args.pageToken = nextRequest;}
                        callback(null, data);
                    }
                });
            }, 200);
        },
        function (err, response) {
            if (err) {
                callback(err);
            }
            else {
                delete args.auth;
                if (args.pageToken === 'STOP') {delete args.pageToken;}
                if (type === 'activities' || type === 'people') {var keyword = args.query;}
                else if (type === 'activitiesUser') {var keyword = args.userId;}
                var results = [];
                if (response === undefined){callback(null, results);}
                else {
                    for (var i = 0; i < response.length; i++) {
                        var post = response[i];
                        if ((i>0 && post.id != response[i-1].id) || (i === 0)) { //évite les doublons
                            post.published = new Date(post.published); // formate la date published dans un format Date
                            var result = {
                                keywords: keyword,
                                date: new Date(),
                                type: 'post',
                                args: args,
                                result: post
                            };
                            results.push(result);
                        }
                    }
                 }
             callback(null, results);
            }
        }
    );
}

function search(type, args, callback) {
// recherche en utilisant l'API Google+ de Google
    if (args.pageToken === 'STOP'){callback(null, []);}
    else {
        console.log('pew pew');
        if (type === 'activities' || 'activitiesUser') {
            var request = plus.activities;
        }
        else if (type === 'people') {
            var request = plus.people;
        }
        if (type === 'activities' || type === 'people') {
            request.search(args, function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, data.items, data.nextPageToken);
                }
            });
        }
        else if (type === 'activitiesUser') {
            request.list(args, function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, data.items, data.nextPageToken);
                }
            });
        }
    }
}


function listRequest(type, args) {
// Permet de depasser la limitation de résultat des requêtes
    if (type === 'activities' || 'people'){var max = 20;}
    else if (type === 'activitiesUser') {var max = 100;}
    var num = args.maxResults;
    var nbRequest = Math.ceil(num / max);
    var table = [];
    for (var i = 1; i <= nbRequest; i++) {
        if (i == nbRequest) {
            if (num % max === 0) {c = max;}
            else {var c = num % max;}
        }
        else {var c = max;}
        table.push({num: c});
    }
    return table;
}

exports.statusSearch = statusSearch;
exports.usersSearch = usersSearch;
exports.userStatus = userStatus;
'use strict';
/**
 * Created by tpineau
 */

var oauth = require('oauth');
var extend = require('extend');
var async = require("async");
var querystring = require('querystring');
var keys = require('./../keys.json');

var twitterConsumerKey = keys.twitterConsumerKey;
var twitterConsumerSecret = keys.twitterConsumerSecret;
var twitterAccessToken = keys.twitterAccessToken;
var twitterAccessTokenSecret = keys.twitterAccessTokenSecret;

function statusSearch(keyword, num, opt_args, callback){
// Fonction de recherche de tweets (statuts) sur Twitter
// Informations sur les arguments optionnels (opt_args): https://dev.twitter.com/rest/reference/get/search/tweets
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {q: keyword, count: num};
    if (opt_args.result_type === undefined) {opt_args.result_type = 'recent';}
    extend(args, opt_args);
    go('tweets', args, callback);
}

function usersSearch(keyword, num, opt_args, callback){
// Fonction de recherche d'utilisateurs sur Twitter
// Informations sur les arguments optionnels (opt_args): https://dev.twitter.com/rest/reference/get/users/search
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {q: keyword, count: num};
    if (opt_args.page === undefined) {opt_args.page = 1;}
    extend(args, opt_args);
    go('users', args, callback);
}

function userStatus(id, num, opt_args, callback) {
// Fonction de recherche de tweets d'un utilisateur particulier sur Twitter
// Informations sur les arguments optionnels (opt_args): https://dev.twitter.com/rest/reference/get/statuses/user_timeline
    if (typeof opt_args === 'function') {callback = opt_args; opt_args = {};}
    var args = {user_id: id, count: num};
    extend(args, opt_args);
    go('userTimeline', args, callback);
}

function go(type, args, callback) {
    var args = args;
    var arr = listRequest(type, args);
    async.concatSeries(
        arr,
        function (item, callback) {
            args.count = item.num;
            if (type === 'users') {args.page = item.page;}
            search(type, args, function(err, data){
                if (err) {callback();}
                else {
                    if ((type === 'tweets' || 'userTimeline') && data.length > 1) {
                        args.max_id = data[data.length-1].id_str;
                    }
                    callback(null, data);
                }
            });
        },
        function (err, response) {
            if (err) {callback(err);}
            else if (type === 'tweets' || 'userTimeline') {
                if (type === 'tweets') {
                    var keyword = args.q;
                    var genre = 'post';
                }
                else if (type === 'userTimeline'){
                    var keyword = args.user_id;
                    var genre = keyword;
                }
                var results = [];
                if (response === undefined){callback(null, results);}
                else {
                    for (var i = 0; i < response.length; i++) {
                        var post = response[i];
                        if ((i>0 && post.id != response[i-1].id) || (i === 0)) { //évite les doublons
                            post.created_at = new Date(post.created_at); // formate la date created_at dans un format Date
                            var result = {
                                keywords: keyword,
                                date: new Date(),
                                type: genre,
                                args: args,
                                result: post
                            };
                            results.push(result);
                        }
                    }
                    callback(null, results);
                }
            }
            else {callback(null, response);} // si user
        }
    );
}

function search(type, args, callback) {
    var baseUrl = 'https://api.twitter.com/1.1/';
    if (type === 'tweets'){baseUrl += 'search/tweets.json';}
    else if (type === 'users'){baseUrl += 'users/search.json';}
    else if (type === 'userTimeline'){baseUrl += 'statuses/user_timeline.json';}
    var options = '?' + querystring.stringify(args);
    var url = baseUrl + options;
    var oa = new oauth.OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', twitterConsumerKey, twitterConsumerSecret, '1.0', null, 'HMAC-SHA1');
    oa.get(url, twitterAccessToken, twitterAccessTokenSecret, function (err, body, response) {
        if (!err && response.statusCode == 200) {
            var data = JSON.parse(body);
            if (type === 'tweets') {
                var data = data.statuses;
            }
            if (type === 'tweets' || 'userTimeline') {
                if (data.length >0 && args.max_id === data[0].id_str) {data.splice(0, 1);}
                if (data.length >0 && args.since_id === data[data.length - 1].id_str) {data.splice(data.length-1, 1);}
            }
            callback(null, data);
        }
        else {callback(err);}
    });

}

function listRequest(type, args) {
// Permet de depasser la limitation de résultat des requêtes
    if (type === 'tweets'){var max = 100;}
    else if (type === 'users') {var max = 20;}
    else if (type === 'userTimeline') {var max = 200;}
    var num = args.count;
    var nbRequest = Math.ceil(num / max);
    var table = [];
    for (var i = 1; i <= nbRequest; i++) {
        if (i == nbRequest) {
            if (num % max === 0) {c = max;}
            else {var c = num % max;}
        }
        else {var c = max;}
        if (type === 'tweets' || type === 'userTimeline') {table.push({num: c});}
        else if (type === 'users') {table.push({num: c, page: i});}
    }
    return table;
}


exports.statusSearch = statusSearch;
exports.usersSearch = usersSearch;
exports.userStatus = userStatus;
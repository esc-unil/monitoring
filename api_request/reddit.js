'use strict';
/**
 * Created by tpineau
 */
    
var querystring = require('querystring');
var request = require('request');
var extend = require('extend');

function redditSearch(keyword, num, opt_args, callback) {
// Recherche de messages sur Reddit
// Informations sur les arguments optionnels (opt_args): https://www.reddit.com/dev/api#GET_search
    subredditSearch(keyword, num, null, opt_args, callback);
}

function subredditSearch(keyword, num, subreddit, opt_args, callback) {
// Recherche de messages dans un subreddit spécifique
// Informations sur les arguments optionnels (opt_args): https://www.reddit.com/dev/api#GET_search
    if (typeof opt_args === 'function') {
        callback = opt_args;
        opt_args = {};
    }
    var args = {limit: num, q: keyword};
    if (opt_args.sort === undefined) {
        opt_args.sort = 'new';
    }
    if (opt_args.restrict_sr === undefined) {
        opt_args.restrict_sr = 'on';
    }
    if (opt_args.t === undefined) {
        opt_args.t = 'all';
    }
    if (opt_args.after === undefined) {
        opt_args.after = null;
    }
    extend(args, opt_args);
    search(subreddit, args, callback);
}


function search(subreddit, args, callback) {
// recherche en utilisant l'API de reddit
    if (subreddit === null) {
        var webSearchUrl = 'http://www.reddit.com/' + '/search.json?';
    }
    else {
        var webSearchUrl = 'http://www.reddit.com/r/' + subreddit + '/search.json?';
    }
    var url = webSearchUrl + querystring.stringify(args);
    request(url, function (err, response, body) {
        if (err) {
            callback(err)
        }
        else {
            var data = JSON.parse(body).data;
            var results = [];
            for (var i = 0; i < data.children.length; i++) {
                var post = data.children[i].data;
                var result = {
                    keywords: args.q,
                    date: new Date(),
                    type: subreddit,
                    args: args,
                    result: post
                };
                results.push(result);
            }
            var after = data.after;
            callback(null, results, after);
        }
    })
}

exports.subredditSearch = subredditSearch;
exports.redditSearch = redditSearch;
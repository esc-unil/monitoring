'use strict';

var querystring = require('querystring');
var request = require('request');
var extend = require('extend');

function redditSearch(keyword, num, opt_args, callback) {
//Recherche de messages sur Reddit
// Informations sur les arguments optionnels (opt_args): https://www.reddit.com/dev/api#GET_search
    subredditSearch(keyword, num, null, opt_args, callback);
}

function subredditSearch(keyword, num, subreddit, opt_args, callback) {
//Recherche de messages dans un subreddit spécifique
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
    var args = querystring.stringify(args);
    var url = webSearchUrl + args;
    var req = request(url, function (err, response, body) {
        if (err) {
            callback(err)
        }
        ;
        var data = JSON.parse(body).data;
        var result = selectData(data.children);
        var after = data.after;
        if (!err && response.statusCode == 200) {
            callback(null, result, after);
        }
    })
}

function selectData(data) {
    var results = [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i].data;
        var obj = {};
        obj.id = item.id;
        obj.url = item.url;
        obj.subreddit = item.subreddit;
        obj.subreddit_id = item.subreddit_id;
        obj.author = item.author;
        obj.created = new Date(item.created * 1000);
        obj.title = item.title;
        obj.text = item.selftext;
        obj.num_comments = item.num_comments;
        obj.likes = item.likes;
        obj.score = item.score;
        obj.ups = item.ups;
        obj.downs = item.downs;
        results.push(obj);
    }
    return results;
}

exports.subredditSearch = subredditSearch;
exports.redditSearch = redditSearch;
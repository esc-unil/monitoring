'use strict';

/*
auteur: tpineau
*/

var querystring = require('querystring');
var request = require('request');
var extend = require('extend');
var async = require("async");
var keys = require('./keys.json'); //fichier keys.js contenant les clefs des APIs

var a = {
	limit: 502, //max 100/requête
	q: 'steroid',
	sort: 'new',
	restrict_sr: 'on',
	t: 'all',
	after: null
	};
//search('Steroidsourcetalk', a, function(err, res, after, before){console.log(JSON.stringify(res));});
//search(null, a, function(err, res, after, before){console.log(JSON.stringify(res));});
go('Steroidsourcetalk', a, function(err, res, after, before){console.log(JSON.stringify(res));});

function subredditSearch(keyword, num, subreddit, opt_args, callback){
//Recherche de messages dans un subreddit spécifique
// Informations sur les arguments optionnels (opt_args): https://www.reddit.com/dev/api#GET_search
	if (typeof opt_args === 'function'){callback = opt_args; 
		opt_args = {sort: 'new', restrict_sr: 'on', t: 'all', after: null};
	}
	if (opt_args.sort === undefined){opt_args.sort = 'new';}
	if (opt_args.restrict_sr === undefined){opt_args.restrict_sr = 'on';}
	if (opt_args.t === undefined){opt_args.t = 'all';}
	if (opt_args.after === undefined){opt_args.after = null;}
	var args = {limit: num, q: keyword}; 
	extend(args, opt_args);
	
}



function search(subreddit, args, callback) {
// recherche en utilisant l'API de reddit
	if (subreddit === null) {var webSearchUrl = 'http://www.reddit.com/'  + '/search.json?'; }
 	else {var webSearchUrl = 'http://www.reddit.com/r/' + subreddit  + '/search.json?';}
 	var args = querystring.stringify(args);
	var url = webSearchUrl + args;
	var req = request(url, function (err, response, body) {
		if (err) {callback(err)};
		var data = JSON.parse(body).data;
		var result = selectData(data.children);
		var after = data.after;
  		if (!err && response.statusCode == 200) {callback(null, result, after);}
	})
}	

function selectData(data){
	var results = [];
		for (var i= 0; i < data.length; i++){
			var item = data[i].data;
			var obj = {};
			obj.id = item.id;
			obj.url = item.url;
			obj.subreddit = item.subreddit;
			obj.subreddit_id = item.subreddit_id;
			obj.author = item.author;
			obj.created = new Date(item.created*1000); //transforme le timestamp en date js
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

/*
boucle pour obtenir plus de 100 résultats, ! si moins de réponses existantes -> reprend les premiers résultats!

go('Steroidsourcetalk', a, function(err, res, after, before){console.log(JSON.stringify(res));});
function go(subreddit, args, callback){
// lance le nombre de requêtes search afin d'obtenir le nombre de resultat souhaités
	global.argum = args;
	var arr = listRequest(args);
	async.concatSeries(arr, 
			function(item, callback){
				args.limit = item.num;
				search(subreddit, args, function(err, result, after){
					args.after = after;
					callback(err, result);}
				);
			}, 
			function(err, response) {
				if (err) callback(err);
				callback(null, response);
			}
	);	
}

function listRequest(args){
// Permet de depasser la limitation de résultat des requêtes (100 par requête)
		var num = args.limit;
		var nbRequest = Math.ceil(num/50);
		var table = [];
		for (var i=1; i <= nbRequest; i++){
			if (i == nbRequest){
				if (num%50 === 0) {c = 50;}
				else {var c = num%50;}
			}
			else {var c = 50;}
			table.push({num:c});
			}
		return table;
}
*/
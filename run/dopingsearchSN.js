'use strict';
/**
 * Created by tpineau
 *
 * Lancer 6 fois par jour
 */

var search = require('./search.js');
var monitoring = require('../monitoring.json');
var google = require('./../storage/google.js');
var bing = require('./../storage/bing.js');
var yahoo = require('./../storage/yahoo.js');
var facebook = require('./../storage/facebook.js');
var twitter = require('./../storage/twitter.js');
var gplus = require('./../storage/google_plus.js');
var youtube = require('./../storage/youtube.js');
var reddit = require('./../storage/reddit.js');

var todo = [
    {platform:'Twitter', fct: twitter.statusSearchNew, keywords:monitoring.keywordsSN, num:1000, opt_args:{}},
    {platform:'Youtube', fct: youtube.searchNew, keywords:monitoring.keywordsSN, num:1000, opt_args:{}},
    {platform:'Google+', fct: gplus.statusSearchNew, keywords:monitoring.keywordsSN, num:500, opt_args:{}},
    {platform:'Reddit', fct: reddit.searchNew, keywords:monitoring.keywordsSN, num:100, opt_args:null}
];

search.run(monitoring.DBrecherche, todo);




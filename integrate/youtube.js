'use strict';
/**
 * Created by tpineau
 */

var mongo = require('./../mongodb.js');
var mongoClient = require('mongodb').MongoClient;
var async = require("async");



getURL({integrate:0}, function(err){console.log('done')});

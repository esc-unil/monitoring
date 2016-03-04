'use strict';
/**
 * Created by tpineau
 */

var querystring = require('querystring');
var request = require('request');
var extend = require('extend');
var fs =require('fs');
var mongoClient = require('mongodb').MongoClient;
var async = require('async');

function connector(id, url, user, apikey, callback){
    var query = 'https://api.import.io/store/connector/' + id + '/_query?input=webpage/url:' + url + "&_user=" + user + "&_apikey=" + apikey;
    request(query, function (err, response) {
        if (err) {
            console.log(err);
        }
        else {
            callback(null, response);
        }
    });
}


function run(mongoPath, collection, id_api, user, apikey, forum, filename, errorfile){
    var data = fs.readFileSync(filename).toString().split("\n");
    mongoClient.connect(mongoPath, function(err, db) {
        if (err) console.log(err);
        async.eachLimit(
            data,
            50,
            function(i, cb){
                if (i==''){cb();}
                else {
                    var l = i.split(';');
                    var url = l[0];
                    var section = l[1];
                    connector(id_api, url, user, apikey, function (err, resp){
                        if (err){
                            fs.appendFileSync(errorfile, i + '\n');
                            cb();
                        } else {
                            if (resp.statusCode == 200){
                                var results = JSON.parse(resp.body).results;
                                //console.log(JSON.stringify(results));
                                async.each(
                                    results,
                                    function(j, cbj){
                                        j.section = section;
                                        j.date_request = new Date(resp.headers.date);
                                        j.forum = forum;
                                        j.url_request = url;
                                        db.collection(collection).insert(j, function(err){
                                            if (err) console.log(err);
                                            cbj();
                                        });
                                    },
                                    function(){
                                        cb();
                                    }
                                );
                            } else {
                                fs.appendFileSync(errorfile, i + '\n');
                                cb();
                            }
                        }

                    });
                }
            },
            function(){
                db.close();
                console.log('done');
            }
        )
    });
}

var user = ''; //a completer
var apikey = ''; //a completer
var path = 'mongodb://localhost:27017/watches';

run(path, 'test', id_api, user, apikey, 'rwg.cc', './rwgcc.csv', './rwgerror.txt')
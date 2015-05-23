'use strict';
/**
 * Created by tpineau
 */

var request = require('request');
var http = require('http');
var async = require('async');
var urlparse = require('url').parse;

function findAllUrls(list, callback){
//recherche tout les URL d'une liste de textes, les URL sont non raccourci et sans doublons
    async.concat(
        list,
        function(item, cbItem) {
            if (item === null || item === undefined){item = '';}
            cbItem(null, findURL(item));
        },
        function(err, res){
            async.concat(
                res,
                function(obj, cbObj) {
                    expandURL(obj, function(err, url){
                        cbObj(null, url);
                    });
                },
                function(err, results){
                    callback(null, singleArray(results));
                }
            );
        }
    );
}

function singleArray(array){ //supprime les doublons dans la liste
    var result = [];
    for (var i=0; i < array.length; i++){
        if (result.indexOf(array[i]) === -1) {result.push(array[i]);}
    }
    return result;
}

function findURL(string){ //cherche tout les URL d'un texte
    var reg = /https?:\/\/[^<>\s^!{}\[\]'"~\/\.,;]+\.[^<>\s^!{}\[\]'"~,;]+[^<>\s^!{}\[\]'"~,;\.\?:&)(*]/ig;
    return string.match(reg);
}

function expandURL(url, callback) {
    var reg = /https?:\/\/([^\/\s\.]+\.[^\/\s\.]+)\/[a-zA-Z0-9]+/i;
    if (reg.exec(url) === null){callback(null, urlparse(url).href);}
    else {
        var pool = new http.Agent({'maxSockets': Infinity});
        var options = {
            method: "HEAD",
            url: url,
            followAllRedirects: true,
            timeout: 50000,
            rejectUnauthorized: false,
            requestCert: true,
            pool: pool
        };
        request(options, function (err, res) {
            if (err) {
                if (err.code === 'ENOTFOUND' && (err.hostname != undefined || err.hostname != '')) {
                    callback(err, 'http://' + err.hostname + '/');
                }
                else {callback(err, urlparse(url).href);}
            } else {
                callback(null, res.request.href);
            }
        }).setMaxListeners(0);
    }
}

exports.findAllUrls = findAllUrls;
'use strict';
/**
 * Created by tpineau
 */

var request = require('request');
var async = require('async');

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

function expandURL(url, callback){ //recupere les URL non raccourcis
    var reg = /https?:\/\/([^\/\s\.]+\.[^\/\s\.]+)\/[a-zA-Z0-9]+/i;
    if (reg.exec(url) === null){callback(null, url);}
    else {
        request( { method: "HEAD", url: url, followAllRedirects: true },
            function (err, res) {
                if (err) {callback(null, url);}
                else {callback(null, res.request.href);}
            }
        );
    }
}

exports.findAllUrls = findAllUrls;
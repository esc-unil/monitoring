'use strict';
/**
 * Created by tpineau
 *
 * remarque: pas d'information sur l'auteur avec l'API youtube
 */

var async = require("async");
var urlparse = require('url').parse;
var tools = require('./tools.js');

function getURL(db, col, target, callback) {
    db.collection('youtube').find(target).toArray(function (err, res) {
        if (err) {callback(err);}
        else {
            async.eachLimit(
                res,
                50,
                function (obj, cbObj) {
                    db.collection('youtube').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                        if (err) console.log(obj._id, err);
                    });
                    var title = obj.result.snippet.title;
                    var description = obj.result.snippet.description;
                    tools.findAllUrls([title, description], function (err, urls){
                        async.each(
                            urls,
                            function(url, cbUrl){
                                var result = {
                                    _id: 'youtube;' + obj._id + ';' + url,
                                    url: url,
                                    hostname: urlparse(url).hostname,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'youtube',
                                    type: 'video',
                                    info: {
                                        id: obj.result.id.videoId,
                                        date: obj.result.snippet.publishedAt
                                    },
                                    integrate: 0
                                };
                                db.collection(col).insert(result, function (err) {
                                    if (err) {console.log(err);}
                                    cbUrl();
                                })
                            },
                            function(err){cbObj();}
                        );
                    });
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
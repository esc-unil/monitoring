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
            async.eachSeries(
                res,
                function (obj, cbObj) {
                    var title = obj.result.snippet.title;
                    var description = obj.result.snippet.description;
                    tools.findAllUrls([title, description], function (err, urls){
                        async.each(
                            urls,
                            function(url, cbUrl){
                                var hostname = urlparse(url).hostname;
                                var result = {
                                    urls: url,
                                    hostname: hostname,
                                    keywords: obj.keywords,
                                    date: obj.date,
                                    platform: 'youtube',
                                    type: obj.type,
                                    source: obj._id,
                                    info: {
                                        date: obj.result.snippet.publishedAt,
                                        id: obj.result.id.videoId
                                    },
                                    integrate: 0
                                };
                                db.collection(col).insert(result, function(err){cbUrl();});
                            },
                            function(err){
                                db.collection('youtube').update({_id: obj._id}, {$set: {integrate: 1}}, function (err) {
                                    if (err) console.log(obj._id, err);
                                    cbObj();
                                });
                            }
                        );
                    });
                },
                function (err) {callback(err);}
            );
        }
    });
}

exports.getURL = getURL;
